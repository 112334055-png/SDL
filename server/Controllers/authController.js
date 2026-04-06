const User = require("../models/User");

// ── Helper: mirror the frontend validators on the server ──────────────────

function validateSignupInput({ firstName, lastName, email, phone, password, confirmPassword }) {
  const errors = {};

  // First name
  if (!firstName?.trim()) errors.firstName = "First name is required";
  else if (/[^a-zA-Z\s'-]/.test(firstName)) errors.firstName = "No special characters or numbers allowed";
  else if (firstName.trim().length < 2) errors.firstName = "Must be at least 2 characters";

  // Last name
  if (!lastName?.trim()) errors.lastName = "Last name is required";
  else if (/[^a-zA-Z\s'-]/.test(lastName)) errors.lastName = "No special characters or numbers allowed";
  else if (lastName.trim().length < 2) errors.lastName = "Must be at least 2 characters";

  // Email
  if (!email?.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "Enter a valid email address";

  // Phone
  if (!phone?.trim()) errors.phone = "Phone number is required";
  else {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) errors.phone = "Must be at least 10 digits";
    else if (digits.length > 15) errors.phone = "Phone number too long";
    else if (!/^[\d\s\-\+\(\)]{7,20}$/.test(phone)) errors.phone = "Invalid phone format";
  }

  // Password
  if (!password) errors.password = "Password is required";
  else if (password.length < 8) errors.password = "Must be at least 8 characters";
  else if (!/[A-Z]/.test(password)) errors.password = "Include at least one uppercase letter";
  else if (!/[0-9]/.test(password)) errors.password = "Include at least one number";
  else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    errors.password = "Include at least one special character";

  // Confirm password
  if (!confirmPassword) errors.confirmPassword = "Please confirm your password";
  else if (confirmPassword !== password) errors.confirmPassword = "Passwords do not match";

  return errors;
}

// ── POST /api/auth/signup ─────────────────────────────────────────────────

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, confirmPassword, role, staffId } = req.body;

    // 🔹 Validate basic fields
    const errors = validateSignupInput({
      firstName,
      lastName,
      email: role === "Member" ? email : "test@test.com", // bypass for librarian
      phone: role === "Member" ? phone : "1234567890",
      password,
      confirmPassword,
    });

    // 🔹 Librarian validation
    if (role === "Librarian") {
      if (!staffId || staffId.trim().length < 4) {
        errors.staffId = "Valid Staff ID required";
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ success: false, errors });
    }

    // 🔹 Check duplicates
    if (role === "Member") {
      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        return res.status(409).json({
          success: false,
          errors: { email: "Email already exists" },
        });
      }
    }

    if (role === "Librarian") {
      const existing = await User.findOne({ staffId });
      if (existing) {
        return res.status(409).json({
          success: false,
          errors: { staffId: "Staff ID already exists" },
        });
      }
    }

    // 🔹 Create user
    const user = await User.create({
      firstName,
      lastName,
      email: role === "Member" ? email : undefined,
      phone: role === "Member" ? phone : undefined,
      password,
      role,
      staffId: role === "Librarian" ? staffId : undefined,
    });

    res.status(201).json({
      success: true,
      message: "Account created",
      user,
    });

  } catch (err) {
  console.error("Signup error:", err.message);
  console.error(err); // FULL ERROR
  res.status(500).json({ 
    success: false, 
    message: err.message   // 👈 TEMP DEBUG
  });
}
};

const bcrypt = require("bcryptjs");

exports.login = async (req, res) => {
  try {
    const { email, password, staffId, mode } = req.body;

    let user;

    if (mode === "member") {
      if (!email) {
        return res.status(400).json({ success: false, message: "Email required" });
      }
user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");    }

    if (mode === "librarian") {
      if (!staffId) {
        return res.status(400).json({ success: false, message: "Staff ID required" });
      }
user = await User.findOne({ staffId: staffId.trim() }).select("+password");    }

    // Inside exports.login, AFTER finding user but BEFORE password check:

if (!user) {
  return res.status(401).json({ success: false, message: "User not found" });
}

// 🔒 BLOCKED USER CHECK - ADD THIS
if (user.isBlocked) {
  return res.status(403).json({ 
    success: false, 
    message: "Account is blocked. Please contact library staff for assistance.",
    blockedAt: user.blockedAt,
  });
}

// Now proceed to password verification...
const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const token = "token_" + user._id;

    res.json({
      success: true,
      token,
      user: {
        name: user.firstName + " " + user.lastName,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};