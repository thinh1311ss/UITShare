const jwt = require("jsonwebtoken");
const userModel = require("../Models/UserModel");
const bcrypt = require("bcrypt");

const userDetail = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await userModel.findById(userId);
    return res.status(200).send(user);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  userDetail,
};
