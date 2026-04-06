// MiddleWare/Auth.js
const jwt  = require("jsonwebtoken");
const User = require("../Models/User");

const JWT_SECRET = process.env.JWT_SECRET || "bibliotheca_dev_secret";

// ── requireAuth ───────────────────────────────────────────────────────────────
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // ✅ Verify — throws if expired or tampered
    const decoded = jwt.verify(token, JWT_SECRET);

    // ✅ Re-fetch user so req.user always reflects DB state
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: "Account is blocked" });
    }

    req.user = user;
    next();

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Session expired. Please log in again." });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    console.error("[requireAuth]", err);
    return res.status(500).json({ success: false, message: "Auth error" });
  }
};

// ── requireLibrarian ──────────────────────────────────────────────────────────
// Chains requireAuth first, then role check
const requireLibrarian = [
  requireAuth,
  (req, res, next) => {
    if (req.user?.role !== "Librarian") {
      return res.status(403).json({ success: false, message: "Librarian access required" });
    }
    next();
  },
];

module.exports = { requireAuth, requireLibrarian };