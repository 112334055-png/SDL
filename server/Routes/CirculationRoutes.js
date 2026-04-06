// routes/circulationRoutes.js
const express = require("express");
const router  = express.Router();

const {
  createRequest,
  getAllRequests,
  getMyRequests,
  getRequestById,
  approveRequest,
  rejectRequest,
  markReturned,
  cancelRequest,
} = require("../Controllers/CirculationController");

const { requireAuth, requireLibrarian } = require("../MiddleWare/Auth");

// ─────────────────────────────────────────────────────────────────────────────
// ⚠️  ORDER MATTERS: specific paths MUST come before /:id wildcard
// ─────────────────────────────────────────────────────────────────────────────

// ── Member routes ─────────────────────────────────────────────────────────────
router.post("/request",  requireAuth,          createRequest);   // POST   /api/circulation/request
router.get( "/my",       requireAuth,          getMyRequests);   // GET    /api/circulation/my

// ── Librarian routes (specific named paths — BEFORE /:id) ────────────────────
router.get(   "/all",         requireLibrarian, getAllRequests);  // GET    /api/circulation/all
router.patch( "/:id/approve", requireLibrarian, approveRequest); // PATCH  /api/circulation/:id/approve
router.patch( "/:id/reject",  requireLibrarian, rejectRequest);  // PATCH  /api/circulation/:id/reject
router.patch( "/:id/return",  requireLibrarian, markReturned);   // PATCH  /api/circulation/:id/return

// ── Wildcard /:id routes — MUST be LAST ──────────────────────────────────────
router.get(   "/:id", requireAuth, getRequestById); // GET    /api/circulation/:id
router.delete("/:id", requireAuth, cancelRequest);  // DELETE /api/circulation/:id

module.exports = router;