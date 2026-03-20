const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String },

  walletAddress: { type: String, unique: true },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  avatar: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
