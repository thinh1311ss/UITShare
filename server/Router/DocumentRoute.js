const express = require("express");
const router = express.Router();
const documentController = require("../Controllers/DocumentController");
const authMiddleware = require("../Middleware/AuthMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const tempDir = "uploads/temp";
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

router.post(
  "/upload",
  [authMiddleware.isAuthentication],
  upload.single("file"),
  documentController.uploadDocument,
);

module.exports = router;
