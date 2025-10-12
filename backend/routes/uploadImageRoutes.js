const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // folder to store images
  },
  filename: function (req, file, cb) {
    // Generate unique name: timestamp + original name
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// POST /api/upload
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  // Return filename to frontend
  res.json({ filename: req.file.filename });
});

module.exports = router;
