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

// ✅ FIXED: Import 'protect' instead of 'requireAuth'
const { protect, requireLibrarian } = require("../MiddleWare/Auth");

// ─────────────────────────────────────────────────────────────────────────────
// ⚠️  ORDER MATTERS: specific paths MUST come before /:id wildcard
// ─────────────────────────────────────────────────────────────────────────────

// ── Member routes (require authentication) ────────────────────────────────────
// ✅ Use 'protect' for all auth-required routes
router.post("/request",  protect,          createRequest);   // POST   /api/circulation/request
router.get( "/my",       protect,          getMyRequests);   // GET    /api/circulation/my
router.get( "/my-requests", protect,       getMyRequests);   // ✅ Alias used by frontend

// ── Librarian routes (require auth + librarian role) ─────────────────────────
// ✅ requireLibrarian internally uses protect, so just chain them
router.get(   "/all",         protect, requireLibrarian, getAllRequests);  // GET    /api/circulation/all
router.patch( "/:id/approve", protect, requireLibrarian, approveRequest); // PATCH  /api/circulation/:id/approve
router.patch( "/:id/reject",  protect, requireLibrarian, rejectRequest);  // PATCH  /api/circulation/:id/reject
router.patch( "/:id/return",  protect, requireLibrarian, markReturned);   // PATCH  /api/circulation/:id/return

// ── Wildcard /:id routes — MUST be LAST ──────────────────────────────────────
router.get(   "/:id", protect, getRequestById); // GET    /api/circulation/:id
router.delete("/:id", protect, cancelRequest);  // DELETE /api/circulation/:id

module.exports = router;