const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const JWT_SECRET = process.env.JWT_SECRET || "bibliotheca_dev_secret";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

// ── SIGNUP ─────────────────────────────
exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, confirmPassword, role = "Member", staffId } = req.body;

    if (!firstName || !lastName || !password) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const existing = await User.findOne(
      role === "Member" ? { email: email?.toLowerCase() } : { staffId }
    );

    if (existing) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

  const savedUser = await User.create({
  firstName,
  lastName,
  email: role === "Member" ? email?.toLowerCase() : undefined,
  phone: role === "Member" ? phone : undefined,
  staffId: role === "Librarian" ? staffId : undefined,
  password,
  role,
});

return res.status(201).json({
  success: true,
  message: "Account created",
  user: {
    _id: savedUser._id,
    id: savedUser._id,
    name: `${savedUser.firstName} ${savedUser.lastName}`,
    role: savedUser.role,
    email: savedUser.email || null,
    staffId: savedUser.staffId || null
  }
});

  } catch (err) {
    console.error("[signup]", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── LOGIN ─────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, staffId, password, mode = "member" } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: "Password required" });
    }

    let user;

    if (mode === "librarian") {
      if (!staffId)
        return res.status(400).json({ success: false, message: "Staff ID required" });

      user = await User.findOne({ staffId }).select("+password");
    } else {
      if (!email)
        return res.status(400).json({ success: false, message: "Email required" });

      user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        email: user.email || null,
        staffId: user.staffId || null
      }
    });

  } catch (err) {
    console.error("[login]", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── LOGOUT ─────────────────────────────
exports.logout = (req, res) => {
  return res.json({ success: true, message: "Logged out" });
};