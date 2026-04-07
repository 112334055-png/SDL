// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../Models/User");

// ✅ Use environment variable - fail loudly if missing in production
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET is required in production environment");
}

/**
 * ✅ Unified authentication middleware
 * - Verifies JWT token from Authorization header or cookie
 * - Fetches fresh user data from database
 * - Attaches user to req.user for downstream handlers
 */
exports.protect = async (req, res, next) => {
  let token;

  // 1️⃣ Extract token from request
  if (req.headers.authorization?.startsWith("Bearer ")) {
    // Format: "Bearer eyJhbGciOiJIUzI1NiIs..."
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    // Fallback to cookie if header not present
    token = req.cookies.token;
  }

  // 2️⃣ Check if token exists
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required" 
    });
  }

  try {
    // 3️⃣ Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 🔍 Debug logging (remove or disable in production)
    if (process.env.DEBUG_AUTH === "true") {
      console.log("🔐 Token decoded:", {
        id: decoded.id,
        userId: decoded.userId,
        role: decoded.role,
        exp: decoded.exp,
        isExpired: decoded.exp && decoded.exp < Math.floor(Date.now() / 1000),
      });
    }

    // 4️⃣ Fetch fresh user from database
    // ✅ Supports both `id` and `userId` in token payload for flexibility
    const userId = decoded.id || decoded.userId;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token payload" 
      });
    }

    req.user = await User.findById(userId).select("-password");
    
    // 5️⃣ Verify user still exists and is active
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // ✅ Optional: Check if user is active (if your schema has an `isActive` field)
    // if (!req.user.isActive) {
    //   return res.status(401).json({ 
    //     success: false, 
    //     message: "Account deactivated" 
    //   });
    // }

    // ✅ All checks passed - proceed to next middleware/handler
    next();
    
  } catch (err) {
    // 🔍 Log error details for debugging
    console.error("❌ Auth middleware error:", {
      name: err.name,
      message: err.message,
      tokenPreview: token?.substring(0, 30) + "...",
    });

    // 6️⃣ Return appropriate error based on JWT error type
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false, 
        message: "Token expired" 
      });
    }
    
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token" 
      });
    }
    
    if (err.name === "NotBeforeError") {
      return res.status(401).json({ 
        success: false, 
        message: "Token not yet active" 
      });
    }

    // Fallback for any other error
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required" 
    });
  }
};

/**
 * ✅ Librarian-only authorization middleware
 * Usage: router.get('/admin', protect, requireLibrarian, handler)
 */
exports.requireLibrarian = (req, res, next) => {
  // ✅ protect middleware must run first to attach req.user
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required" 
    });
  }

  if (req.user.role !== "Librarian") {
    return res.status(403).json({ 
      success: false, 
      message: "Librarian access required" 
    });
  }

  next();
};

/**
 * ✅ Optional: Member-only authorization (if you need to restrict to non-librarians)
 * Usage: router.get('/profile', protect, requireMember, handler)
 */
exports.requireMember = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required" 
    });
  }

  if (req.user.role !== "Member") {
    return res.status(403).json({ 
      success: false, 
      message: "Member access required" 
    });
  }

  next();
};

/**
 * ✅ Optional: Optional auth middleware (doesn't fail if no token)
 * Usage: router.get('/books', optionalAuth, handler)
 * - Attaches req.user if token is valid, otherwise continues with req.user = null
 */
exports.optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    // No token = anonymous user, continue anyway
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id || decoded.userId;
    
    if (userId) {
      req.user = await User.findById(userId).select("-password");
    } else {
      req.user = null;
    }
  } catch (err) {
    // Invalid/expired token = anonymous user, continue anyway
    req.user = null;
  }

  next();
};

// ✅ Export all middlewares
module.exports = {
  protect: exports.protect,
  requireLibrarian: exports.requireLibrarian,
  requireMember: exports.requireMember,
  optionalAuth: exports.optionalAuth,
};