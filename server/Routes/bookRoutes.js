// Routes/bookRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 📁 Ensure upload directory exists
const uploadDir = path.join(__dirname, "../../uploads/covers");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 📸 Multer config for cover images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `cover-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files (JPEG, PNG, WebP) are allowed"));
  },
});

const bookController = require("../Controllers/bookController");

// 📖 READ routes (public)
router.get("/", bookController.getAllBooks);
router.get("/:id", bookController.getBookById);

// 📝 WRITE routes - ✅ multer MUST come BEFORE controller
// For FormData uploads, multer parses both files AND text fields into req.body
router.post("/upload", upload.single("coverImage"), bookController.uploadBook);
router.patch("/:id", upload.single("coverImage"), bookController.updateBook);
router.delete("/:id", bookController.deleteBook);

module.exports = router;