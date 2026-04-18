const { ethers } = require("ethers");
const documentModel = require("../Models/DocumentModel");
const listingModel = require("../Models/ListingModel");
const nftModel = require("../Models/NFTModel");
const transactionModel = require("../Models/TransactionModel");
const userModel = require("../Models/UserModel");

//ABI
const MARKETPLACE_ABI = [
  "function addOrder(uint256 tokenId_, uint256 amount_, uint256 price_) external",
  "function cancelOrder(uint256 orderId_) external",
  "function executeOrder(uint256 orderId_) external payable",
  "function transferWithRoyalty(address to_, uint256 tokenId_, uint256 amount_, uint256 transferValue_) external payable",
  "function orders(uint256) view returns (address seller, uint256 tokenId, uint256 amount, uint256 price, bool active)",
  "event OrderAdded(uint256 indexed orderId, address indexed seller, uint256 indexed tokenId, uint256 amount, uint256 price)",
  "event OrderCancelled(uint256 indexed orderId)",
  "event OrderMatched(uint256 indexed orderId, address indexed seller, address indexed buyer, uint256 price, uint256 marketplaceFee, uint256 royaltyAmount)",
  "event TransferWithRoyalty(address indexed from, address indexed to, uint256 indexed tokenId, uint256 amount, uint256 royaltyAmount)",
];

//  Helpers
const getProvider = () =>
  new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

const getBackendSigner = () =>
  new ethers.Wallet(process.env.PRIVATE_KEY, getProvider());

const getMarketplaceContract = (signerOrProvider) =>
  new ethers.Contract(
    process.env.MARKETPLACE_CONTRACT_ADDRESS,
    MARKETPLACE_ABI,
    signerOrProvider,
  );

const parseEventFromReceipt = (receipt, eventName) => {
  const iface = new ethers.Interface(MARKETPLACE_ABI);
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed?.name === eventName) return parsed.args;
    } catch (_) {}
  }
  return null;
};

//  createListing
const createListing = async ({
  sellerId,
  sellerAddress,
  documentId,
  tokenId,
  amount,
  price,
  isOriginalCreator = true,
}) => {
  const signer = getBackendSigner();
  const marketplace = getMarketplaceContract(signer);

  const priceInWei = ethers.parseEther(String(price));

  const tx = await marketplace.addOrder(tokenId, amount, priceInWei);
  const receipt = await tx.wait();

  const args = parseEventFromReceipt(receipt, "OrderAdded");
  if (!args) throw new Error("Không lấy được orderId từ event OrderAdded");

  const orderId = args.orderId.toString();

  const listing = await listingModel.create({
    seller: sellerId,
    sellerAddress,
    document: documentId,
    tokenId: String(tokenId),
    orderId,
    amount,
    price,
    isOriginalCreator,
    listTxHash: receipt.hash,
    status: "active",
  });

  await transactionModel.create({
    fromUser: sellerId,
    fromAddress: sellerAddress,
    document: documentId,
    tokenId: String(tokenId),
    orderId,
    quantity: amount,
    price,
    type: "list",
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    status: "success",
  });

  return listing;
};

//  buyDocument
const buyDocument = async (req, res) => {
  try {
    const { orderId } = req.body;
    const buyerId = req.userId;

    if (!orderId) {
      return res.status(400).json({ message: "Thiếu orderId" });
    }

    // 1. Kiểm tra listing
    const listing = await listingModel
      .findOne({ orderId, status: "active" })
      .populate("document");

    if (!listing) {
      return res
        .status(404)
        .json({ message: "Listing không tồn tại hoặc đã hết hàng" });
    }

    const document = listing.document;

    //  2. Kiểm tra user đã sở hữu NFT này chưa
    const existingNFT = await nftModel.findOne({
      user: buyerId,
      tokenId: listing.tokenId,
    });
    if (existingNFT) {
      return res
        .status(400)
        .json({ message: "Bạn đã sở hữu tài liệu này rồi" });
    }

    // 3. Kiểm tra buyer có ví chưa
    const buyer = await userModel.findById(buyerId);
    if (!buyer?.walletAddress) {
      return res
        .status(400)
        .json({ message: "Bạn cần liên kết ví trước khi mua" });
    }

    // 4. Không cho seller tự mua listing của mình
    if (
      listing.sellerAddress.toLowerCase() === buyer.walletAddress.toLowerCase()
    ) {
      return res
        .status(400)
        .json({ message: "Bạn không thể mua listing của chính mình" });
    }

    // 5. Kiểm tra ETH balance của backend wallet
    const signer = getBackendSigner();
    const priceInWei = ethers.parseEther(String(listing.price));
    const backendBalance = await signer.provider.getBalance(signer.address);

    if (backendBalance < priceInWei) {
      return res.status(503).json({
        message:
          "Hệ thống tạm thời không đủ ETH để xử lý giao dịch, vui lòng thử lại sau",
      });
    }

    // 6. Verify order còn active trên chain trước khi execute
    const marketplace = getMarketplaceContract(signer);
    const onChainOrder = await marketplace.orders(orderId);
    if (!onChainOrder.active) {
      listing.status = "sold";
      await listing.save();
      return res
        .status(409)
        .json({ message: "Order này đã được mua hoặc hủy trên blockchain" });
    }

    // 7. Execute order on-chain
    const tx = await marketplace.executeOrder(orderId, { value: priceInWei });
    const receipt = await tx.wait();

    if (receipt.status !== 1) {
      return res
        .status(500)
        .json({ message: "Transaction thất bại trên blockchain" });
    }

    // 8. Parse event OrderMatched
    const args = parseEventFromReceipt(receipt, "OrderMatched");
    const marketplaceFee = args?.marketplaceFee ?? 0n;
    const royaltyPaid = args?.royaltyAmount ?? 0n;
    const sellerReceived = priceInWei - marketplaceFee - royaltyPaid;

    // 9. Cập nhật DB
    listing.status = "sold";
    listing.soldAt = new Date();
    await listing.save();

    await documentModel.findByIdAndUpdate(document._id, {
      $inc: { remainingSupply: -listing.amount },
    });

    await nftModel.findOneAndUpdate(
      { user: buyerId, tokenId: listing.tokenId },
      {
        $inc: { amount: listing.amount },
        $setOnInsert: {
          user: buyerId,
          document: document._id,
          tokenId: listing.tokenId,
          ownerAddress: buyer.walletAddress,
        },
      },
      { upsert: true, new: true },
    );

    await transactionModel.create({
      fromUser: listing.seller,
      toUser: buyerId,
      fromAddress: listing.sellerAddress,
      toAddress: buyer.walletAddress,
      document: document._id,
      tokenId: listing.tokenId,
      orderId,
      quantity: listing.amount,
      price: listing.price,
      marketplaceFee: Number(ethers.formatEther(marketplaceFee)),
      royaltyPaid: Number(ethers.formatEther(royaltyPaid)),
      sellerReceived: Number(ethers.formatEther(sellerReceived)),
      isSecondary: !listing.isOriginalCreator,
      type: "buy",
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: "success",
    });

    return res.status(200).json({
      message: "Mua tài liệu thành công",
      txHash: receipt.hash,
    });
  } catch (error) {
    console.error("[buyDocument]", error);
    return res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

// cancelListing
const cancelListing = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.userId;

    if (!orderId) {
      return res.status(400).json({ message: "Thiếu orderId" });
    }

    // 1. Kiểm tra listing trong DB
    const listing = await listingModel.findOne({ orderId, status: "active" });
    if (!listing) {
      return res
        .status(404)
        .json({ message: "Listing không tồn tại hoặc đã không còn active" });
    }

    // 2. Chỉ seller mới được hủy
    if (listing.seller.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền hủy listing này" });
    }

    // 3. Verify order còn active trên chain
    const signer = getBackendSigner();
    const marketplace = getMarketplaceContract(signer);
    const onChainOrder = await marketplace.orders(orderId);

    if (!onChainOrder.active) {
      listing.status = "cancelled";
      await listing.save();
      return res
        .status(409)
        .json({ message: "Order này đã không còn active trên blockchain" });
    }

    // 4. Cancel on-chain
    const tx = await marketplace.cancelOrder(orderId);
    const receipt = await tx.wait();

    if (receipt.status !== 1) {
      return res
        .status(500)
        .json({ message: "Transaction cancel thất bại trên blockchain" });
    }

    // 5. Cập nhật DB
    listing.status = "cancelled";
    listing.cancelledAt = new Date();
    await listing.save();

    // Hoàn lại remainingSupply cho document
    await documentModel.findByIdAndUpdate(listing.document, {
      $inc: { remainingSupply: listing.amount },
    });

    const seller = await userModel.findById(userId);

    await transactionModel.create({
      fromUser: userId,
      fromAddress: listing.sellerAddress ?? seller?.walletAddress,
      document: listing.document,
      tokenId: listing.tokenId,
      orderId,
      quantity: listing.amount,
      price: listing.price,
      type: "cancel",
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: "success",
    });

    return res.status(200).json({
      message: "Hủy listing thành công",
      txHash: receipt.hash,
    });
  } catch (error) {
    console.error("[cancelListing]", error);
    return res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

// transferNFT
const transferNFT = async (req, res) => {
  try {
    const { toAddress, tokenId, amount, txHash } = req.body;
    const fromUserId = req.userId;

    if (!toAddress || !tokenId || !amount || !txHash) {
      return res.status(400).json({ message: "Thiếu thông tin transfer" });
    }

    // 1. Chống replay: txHash không được xử lý 2 lần
    const existingTx = await transactionModel.findOne({ txHash });
    if (existingTx) {
      return res.status(409).json({ message: "Transaction này đã được xử lý" });
    }

    // 2. Verify transaction on-chain
    const provider = getProvider();
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      return res
        .status(400)
        .json({ message: "Không tìm thấy transaction trên blockchain" });
    }

    if (receipt.status !== 1) {
      return res
        .status(400)
        .json({ message: "Transaction đã thất bại trên blockchain" });
    }

    // 3. Verify tx gọi đúng contract marketplace
    if (
      receipt.to?.toLowerCase() !==
      process.env.MARKETPLACE_CONTRACT_ADDRESS.toLowerCase()
    ) {
      return res.status(400).json({
        message: "Transaction không tương tác với marketplace contract",
      });
    }

    // 4. Parse event TransferWithRoyalty để verify params
    const iface = new ethers.Interface(MARKETPLACE_ABI);
    let eventArgs = null;

    for (const log of receipt.logs) {
      try {
        const parsed = iface.parseLog(log);
        if (parsed?.name === "TransferWithRoyalty") {
          const sameToken = parsed.args.tokenId.toString() === String(tokenId);
          const sameAmount = parsed.args.amount.toString() === String(amount);
          const sameTo =
            parsed.args.to.toLowerCase() === toAddress.toLowerCase();
          if (sameToken && sameAmount && sameTo) {
            eventArgs = parsed.args;
            break;
          }
        }
      } catch (_) {}
    }

    if (!eventArgs) {
      return res.status(400).json({
        message:
          "Không tìm thấy event TransferWithRoyalty hợp lệ trong transaction",
      });
    }

    const royaltyPaid = eventArgs.royaltyAmount ?? 0n;
    const fromAddress = eventArgs.from.toLowerCase();

    // 5. Verify fromAddress khớp với user đang request
    const fromUser = await userModel.findById(fromUserId);
    if (!fromUser?.walletAddress) {
      return res.status(400).json({ message: "Tài khoản chưa liên kết ví" });
    }
    if (fromUser.walletAddress.toLowerCase() !== fromAddress) {
      return res.status(403).json({
        message: "Địa chỉ ví không khớp với người gửi trong transaction",
      });
    }

    // 6. Kiểm tra DB: fromUser có đủ NFT không
    const fromNFT = await nftModel.findOne({
      user: fromUserId,
      tokenId: String(tokenId),
    });
    if (!fromNFT || fromNFT.amount < amount) {
      return res
        .status(400)
        .json({ message: "Bạn không có đủ NFT để transfer" });
    }

    // 7. Tìm toUser theo địa chỉ ví
    const toUser = await userModel.findOne({
      walletAddress: toAddress.toLowerCase(),
    });

    const document = await documentModel.findOne({ tokenId: String(tokenId) });

    // 8. Cập nhật NFT ownership
    if (fromNFT.amount === Number(amount)) {
      await nftModel.deleteOne({ user: fromUserId, tokenId: String(tokenId) });
    } else {
      await nftModel.findOneAndUpdate(
        { user: fromUserId, tokenId: String(tokenId) },
        { $inc: { amount: -Number(amount) } },
      );
    }

    if (toUser) {
      await nftModel.findOneAndUpdate(
        { user: toUser._id, tokenId: String(tokenId) },
        {
          $inc: { amount: Number(amount) },
          $setOnInsert: {
            user: toUser._id,
            document: document?._id,
            tokenId: String(tokenId),
            ownerAddress: toAddress.toLowerCase(),
          },
        },
        { upsert: true, new: true },
      );
    }

    // 9. Lưu transaction
    await transactionModel.create({
      fromUser: fromUserId,
      toUser: toUser?._id ?? null,
      fromAddress: fromUser.walletAddress,
      toAddress: toAddress.toLowerCase(),
      document: document?._id,
      tokenId: String(tokenId),
      quantity: Number(amount),
      royaltyPaid: Number(ethers.formatEther(royaltyPaid)),
      type: "transfer",
      txHash,
      blockNumber: receipt.blockNumber,
      status: "success",
    });

    return res.status(200).json({ message: "Transfer NFT thành công" });
  } catch (error) {
    console.error("[transferNFT]", error);
    return res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

// checkAccess
const checkAccess = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.userId;

    const document = await documentModel.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: "Không tìm thấy tài liệu" });
    }

    if (document.price === 0) {
      return res.json({ hasAccess: true, reason: "free" });
    }

    if (document.author.toString() === userId) {
      return res.json({ hasAccess: true, reason: "author" });
    }

    const nft = await nftModel.findOne({
      user: userId,
      tokenId: document.tokenId,
    });

    if (nft && nft.amount > 0) {
      return res.json({ hasAccess: true, reason: "owner" });
    }

    return res.json({ hasAccess: false });
  } catch (error) {
    console.error("[checkAccess]", error);
    return res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

module.exports = {
  createListing,
  buyDocument,
  cancelListing,
  transferNFT,
  checkAccess,
};
