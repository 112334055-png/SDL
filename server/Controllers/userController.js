// Controllers/userController.js
const User = require("../Models/User");
const bcrypt = require("bcryptjs");

// ── Middleware: Verify Librarian Role ───────────────────────────────────
const requireLibrarian = (req, res, next) => {
  // Assuming you have auth middleware that sets req.user
  if (!req.user || req.user.role !== "Librarian") {
    return res.status(403).json({ 
      success: false, 
      message: "Librarian access required" 
    });
  }
  next();
};

// ── GET /api/users/members - List all members ───────────────────────────
exports.listMembers = async (req, res) => {
  try {
    const members = await User.find({ role: "Member" })
      .select("-password -__v")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: members.length,
      data: members.map(user => ({
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        isBlocked: user.isBlocked || false,
        joinedAt: user.createdAt,
        lastLogin: user.lastLogin || null,
      })),
    });
  } catch (err) {
    console.error("List members error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch members" 
    });
  }
};

// ── PATCH /api/users/:id/block - Toggle block status ─────────────────────
exports.toggleBlockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { block } = req.body; // true = block, false = unblock

    if (typeof block !== "boolean") {
      return res.status(400).json({ 
        success: false, 
        message: "Block status must be a boolean" 
      });
    }

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    if (user.role !== "Member") {
      return res.status(400).json({ 
        success: false, 
        message: "Can only block/unblock Member accounts" 
      });
    }

    user.isBlocked = block;
    user.blockedAt = block ? new Date() : undefined;
    user.blockedBy = block ? req.user?._id : undefined;
    
    await user.save();

    res.json({
      success: true,
      message: `User ${block ? "blocked" : "unblocked"} successfully`,
      data: {
        id: user._id,
        isBlocked: user.isBlocked,
        blockedAt: user.blockedAt,
      },
    });

  } catch (err) {
    console.error("Toggle block error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update user status" 
    });
  }
};

// ── GET /api/users/search - Search members by name/email ─────────────────
exports.searchMembers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.json({ success: true, count: 0, data: [] });
    }

    const searchRegex = new RegExp(query.trim(), "i");
    
    const members = await User.find({
      role: "Member",
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
      ],
    })
      .select("-password -__v")
      .limit(50)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: members.length,
      data: members.map(user => ({
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        isBlocked: user.isBlocked || false,
        joinedAt: user.createdAt,
      })),
    });

  } catch (err) {
    console.error("Search members error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Search failed" 
    });
  }
};