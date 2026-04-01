const jwt = require("jsonwebtoken");
const userModel = require("../Models/UserModel");
const bcrypt = require("bcrypt");

const getUserDetail = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await userModel.findById(userId);
    return res.status(200).send(user);
  } catch (error) {
    console.log(error);
  }
};

const updateUserInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    const { userName, studentId, bio, facebookLink } = req.body;

    const updateData = { userName, studentId, bio, facebookLink };

    if (req.files?.avatar) {
      updateData.avatar = `http://localhost:5000/uploads/avatar/${req.files.avatar[0].filename}`;
    }
    if (req.files?.coverImage) {
      updateData.coverImage = `http://localhost:5000/uploads/coverImage/${req.files.coverImage[0].filename}`;
    }

    const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateWallet = async (req, res) => {
  try {
    const { userId } = req.params;
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ message: "Không có địa chỉ ví" });
    }

    // Kiểm tra ví đã được dùng bởi user khác chưa
    const existingUser = await userModel.findOne({
      walletAddress: walletAddress.toLowerCase(),
    });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res
        .status(400)
        .json({ message: "Ví này đã được liên kết với tài khoản khác" });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { walletAddress: walletAddress.toLowerCase() },
      { new: true },
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserDetail,
  updateUserInfo,
  updateWallet,
};
