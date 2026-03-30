const PinataSDK = require("@pinata/sdk");
const fs = require("fs");
const documentModel = require("../Models/DocumentModel");
const userModel = require("../Models/UserModel");

const pinata = new PinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_KEY,
);

const uploadDocument = async (req, res) => {
  try {
    const { subject, category, description, price, royaltyPercent } = req.body;
    const userId = req.userId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Không có file được gửi lên" });
    }

    // Lấy thông tin user để lấy walletAddress
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    // 1. Upload file lên IPFS qua Pinata
    const readableStream = fs.createReadStream(file.path);
    const ipfsResult = await pinata.pinFileToIPFS(readableStream, {
      pinataMetadata: { name: file.originalname },
    });

    const cid = ipfsResult.IpfsHash;
    const fileUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;

    // 2. Xoá file tạm
    fs.unlinkSync(file.path);

    const parsedPrice = parseFloat(price) || 0;
    const parsedRoyalty = parseInt(royaltyPercent) || 10;
    const parsedAmount = parseInt(amount) || 1;

    // 3. Lưu vào MongoDB
    const newDocument = await documentModel.create({
      title: file.originalname,
      description,
      fileUrl,
      cid,
      author: userId,
      authorWallet: user.walletAddress || null,
      subject,
      category,
      price: parsedPrice,
      accessType: parsedPrice > 0 ? "paid" : "free",
      royaltyPercent: parsedRoyalty,
      royaltyReceiver: user.walletAddress || null,
      amount: parsedAmount,
      totalSupply: parsedAmount,
    });

    res.status(201).json(newDocument);
  } catch (error) {
    // Xoá file tạm nếu có lỗi
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadDocument };
