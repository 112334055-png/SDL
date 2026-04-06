const express = require("express");
const router = express.Router();

const {
  listMembers,
  toggleBlockUser,
  searchMembers,
} = require("../Controllers/userController");

// Correct routes
router.get("/members", listMembers);
router.get("/search", searchMembers);
router.patch("/:id/block", toggleBlockUser);

module.exports = router;