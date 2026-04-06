// routes/userRoutes.js
const express = require("express");
const router  = express.Router();

const { listMembers, searchMembers, toggleBlockUser } = require("../Controllers/userController");
const { requireAuth, requireLibrarian }               = require("../MiddleWare/Auth");

// GET  /api/users/members          — librarian: list all members
// GET  /api/users/search?query=... — librarian: search members
// PATCH /api/users/:id/block       — librarian: block or unblock

// ⚠️  /search and /members MUST come before /:id
router.get("/members",  requireLibrarian, listMembers);
router.get("/search",   requireLibrarian, searchMembers);
router.patch("/:id/block", requireLibrarian, toggleBlockUser);

module.exports = router;