const express = require("express");
const router = express.Router();
const personalController = require("../Controllers/PersonalController");
const AuthMiddleware = require("../Middleware/AuthMiddleware");

router.get(
  "/userDetail/:userId",
  [AuthMiddleware.isAuthentication],
  personalController.userDetail,
);

module.exports = router;
