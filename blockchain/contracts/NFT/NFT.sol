const PinataSDK = require("@pinata/sdk");
const fs = require("fs");
const { ethers } = require("ethers"); // ← thêm
const documentModel = require("../Models/DocumentModel");
const userModel = require("../Models/UserModel");

const pinata = new PinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_KEY,
);

// ABI chỉ cần hàm mint
const NFT_ABI = [
  "function mint(address to, uint256 tokenId, uint256 amount, uint256 royaltyBps, string memory uri) external",
  "function nextTokenId() view returns (uint256)",
];

const uploadDocument = async (req, res) => {
  try {
    const { subject, category, description, price, royaltyPercent, amount } = req.body; // ← thêm amount
    const userId = req.userId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Không có file được gửi lên" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    if (!user.walletAddress) {
      return res.status(400).json({ message: "Bạn cần liên kết ví trước khi đăng tài liệu" });
    }

    // 1. Upload file lên IPFS
    const readableStream = fs.createReadStream(file.path);
    const ipfsResult = await pinata.pinFileToIPFS(readableStream, {
      pinataMetadata: { name: file.originalname },
    });
    const cid = ipfsResult.IpfsHash;
    const fileUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
    fs.unlinkSync(file.path);

    // 2. Upload metadata lên IPFS
    const metadata = {
      name: file.originalname,
      description: description || "",
      file: fileUrl,
      subject,
      category,
      author: user.walletAddress,
    };
    const metadataResult = await pinata.pinJSONToIPFS(metadata, {
      pinataMetadata: { name: `${file.originalname}_metadata` },
    });
    const metadataUri = `https://gateway.pinata.cloud/ipfs/${metadataResult.IpfsHash}`;

    const parsedPrice = parseFloat(price) || 0;
    const parsedRoyalty = parseInt(royaltyPercent) || 10;
    const parsedAmount = parseInt(amount) || 1;

    // 3. Mint NFT lên blockchain
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const nftContract = new ethers.Contract(
      process.env.NFT_CONTRACT_ADDRESS,
      NFT_ABI,
      signer,
    );

    // Lấy tokenId tiếp theo từ contract
    const nextTokenId = await nftContract.nextTokenId();

    // royaltyBps: 10% = 1000 (basis points, 1% = 100)
    const royaltyBps = parsedRoyalty * 100;

    const tx = await nftContract.mint(
      user.walletAddress, // mint vào ví của tác giả
      nextTokenId,
      parsedAmount,
      royaltyBps,
      metadataUri,
    );
    const receipt = await tx.wait(); // chờ transaction được confirm

    // 4. Lưu vào MongoDB
    const newDocument = await documentModel.create({
      title: file.originalname,
      description,
      fileUrl,
      cid,
      author: userId,
      authorWallet: user.walletAddress,
      subject,
      category,
      price: parsedPrice,
      accessType: parsedPrice > 0 ? "paid" : "free",
      royaltyPercent: parsedRoyalty,
      royaltyReceiver: user.walletAddress,
      amount: parsedAmount,
      totalSupply: parsedAmount,
      tokenId: Number(nextTokenId),
      contractAddress: process.env.NFT_CONTRACT_ADDRESS,
      isMinted: true,
    });

    res.status(201).json(newDocument);
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadDocument };