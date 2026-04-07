// routes/userRoutes.js
const express = require("express");
const router  = express.Router();

// ✅ Import controller functions
const { listMembers, searchMembers, toggleBlockUser } = require("../Controllers/userController");

// ✅ FIXED: Import 'protect' instead of 'requireAuth'
const { protect, requireLibrarian } = require("../MiddleWare/Auth");

// Debug logs (optional - remove after testing)
console.log("🔍 protect:", typeof protect);                 // Should be "function"
console.log("🔍 requireLibrarian:", typeof requireLibrarian); // Should be "function"
console.log("🔍 listMembers:", typeof listMembers);         // Should be "function"

// ⚠️  /search and /members MUST come before /:id
// ✅ Use 'protect' for authentication, then 'requireLibrarian' for role check
router.get("/members", protect, requireLibrarian, listMembers);
router.get("/search", protect, requireLibrarian, searchMembers);
router.patch("/:id/block", protect, requireLibrarian, toggleBlockUser);

module.exports = router;