const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const User   = require("../Models/User");

const JWT_SECRET  = process.env.JWT_SECRET  || "bibliotheca_dev_secret";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

// ── Validators ────────────────────────────────────────────────────────────────

function validateSignupInput({ firstName, lastName, email, phone, password, confirmPassword }) {
  const errors = {};

  if (!firstName?.trim()) errors.firstName = "First name is required";
  else if (/[^a-zA-Z\s'-]/.test(firstName)) errors.firstName = "No special characters or numbers allowed";
  else if (firstName.trim().length < 2) errors.firstName = "Must be at least 2 characters";

  if (!lastName?.trim()) errors.lastName = "Last name is required";
  else if (/[^a-zA-Z\s'-]/.test(lastName)) errors.lastName = "No special characters or numbers allowed";
  else if (lastName.trim().length < 2) errors.lastName = "Must be at least 2 characters";

  if (!email?.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "Enter a valid email address";

  if (!phone?.trim()) errors.phone = "Phone number is required";
  else {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) errors.phone = "Must be at least 10 digits";
    else if (digits.length > 15) errors.phone = "Phone number too long";
    else if (!/^[\d\s\-\+\(\)]{7,20}$/.test(phone)) errors.phone = "Invalid phone format";
  }

  if (!password) errors.password = "Password is required";
  else if (password.length < 8) errors.password = "Must be at least 8 characters";
  else if (!/[A-Z]/.test(password)) errors.password = "Include at least one uppercase letter";
  else if (!/[0-9]/.test(password)) errors.password = "Include at least one number";
  else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    errors.password = "Include at least one special character";

  if (!confirmPassword) errors.confirmPassword = "Please confirm your password";
  else if (confirmPassword !== password) errors.confirmPassword = "Passwords do not match";

  return errors;
}

// ── POST /api/auth/signup ─────────────────────────────────────────────────────

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, confirmPassword, role = "Member", staffId } = req.body;

    const errors = validateSignupInput({
      firstName,
      lastName,
      email:           role === "Member" ? email           : "placeholder@x.com",
      phone:           role === "Member" ? phone           : "1234567890",
      password,
      confirmPassword,
    });

    if (role === "Librarian") {
      if (!staffId || staffId.trim().length < 4) {
        errors.staffId = "Staff ID must be at least 4 characters";
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ success: false, errors });
    }

    if (role === "Member") {
      const exists = await User.findOne({ email: email.toLowerCase().trim() });
      if (exists) {
        return res.status(409).json({ success: false, errors: { email: "Email already registered" } });
      }
    }

    if (role === "Librarian") {
      const exists = await User.findOne({ staffId: staffId.trim() });
      if (exists) {
        return res.status(409).json({ success: false, errors: { staffId: "Staff ID already exists" } });
      }
    }

    const user = await User.create({
      firstName,
      lastName,
      email:   role === "Member"    ? email.toLowerCase().trim() : undefined,
      phone:   role === "Member"    ? phone                      : undefined,
      staffId: role === "Librarian" ? staffId.trim()             : undefined,
      password,
      role,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user,
    });

  } catch (err) {
    console.error("[signup]", err);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({ success: false, errors: { [field]: `${field} already in use` } });
    }
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────

exports.login = async (req, res) => {
  try {
    const { email, password, staffId, mode = "member" } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    let user;

    if (mode === "member") {
      if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
      }
      user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    }

    if (mode === "librarian") {
      if (!staffId) {
        return res.status(400).json({ success: false, message: "Staff ID is required" });
      }
      user = await User.findOne({ staffId: staffId.trim() }).select("+password");
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Account is blocked. Please contact library staff.",
      });
    }

    // ✅ bcrypt.compare directly — no instance method needed
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // ✅ Real JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email || null },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id:      user._id,
        name:    `${user.firstName} ${user.lastName}`,
        email:   user.email   || null,
        staffId: user.staffId || null,
        role:    user.role,
        initials:`${user.firstName[0]}${user.lastName[0]}`.toUpperCase(),
      },
    });

  } catch (err) {
    console.error("[login]", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ── POST /api/auth/logout ─────────────────────────────────────────────────────

exports.logout = (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ success: true, message: "Logged out successfully" });
};