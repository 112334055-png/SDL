// Models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ==============================
// 🧾 SCHEMA
// ==============================

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "Must be at least 2 characters"],
      match: [/^[a-zA-Z\s'-]+$/, "No special characters or numbers allowed"],
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Must be at least 2 characters"],
      match: [/^[a-zA-Z\s'-]+$/, "No special characters or numbers allowed"],
    },

    email: {
      type: String,
      required: function () {
        return this.role === "Member";
      },
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Enter a valid email address"],
    },

    phone: {
      type: String,
      required: function () {
        return this.role === "Member";
      },
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Must be at least 8 characters"],
      select: false, // ✅ Never return password in queries by default
    },

    // ✅ ROLE
    role: {
      type: String,
      enum: ["Member", "Librarian"],
      default: "Member",
    },

    // ✅ STAFF ID (ONLY FOR LIBRARIAN)
    staffId: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },

    // ── 🔒 Block/Unblock Fields ─────────────────────────────────────
    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },
    blockedAt: {
      type: Date,
    },
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// ==============================
// 🔐 HASH PASSWORD
// ==============================

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ==============================
// 🔐 COMPARE PASSWORD
// ==============================

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// ==============================
// 🔐 REMOVE SENSITIVE FIELDS FROM RESPONSE
// ==============================

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  if (!obj.isBlocked) {
    delete obj.blockedAt;
    delete obj.blockedBy;
  }
  return obj;
};

// ==============================
// 🔒 BLOCK/UNBLOCK HELPER METHOD
// ==============================

userSchema.methods.setBlocked = async function (block, librarianId = null) {
  const wasBlocked = this.isBlocked;
  this.isBlocked = Boolean(block);
  
  if (block) {
    this.blockedAt = new Date();
    if (librarianId) this.blockedBy = librarianId;
  } else {
    this.blockedAt = undefined;
    this.blockedBy = undefined;
  }
  
  if (wasBlocked !== this.isBlocked) {
    return await this.save();
  }
  return this;
};

// ==============================
// 🔍 UTILITY INSTANCE METHODS
// ==============================

userSchema.methods.isActive = function () {
  return !this.isBlocked;
};

userSchema.methods.isLibrarian = function () {
  return this.role === "Librarian";
};

userSchema.methods.isMember = function () {
  return this.role === "Member";
};

// ==============================
// 📊 STATIC QUERY HELPERS
// ==============================

userSchema.statics.findActiveMembers = function () {
  return this.find({ role: "Member", isBlocked: false })
    .select("-password")
    .sort({ createdAt: -1 });
};

userSchema.statics.findBlockedMembers = function () {
  return this.find({ role: "Member", isBlocked: true })
    .select("-password")
    .sort({ blockedAt: -1 });
};

userSchema.statics.findByEmailSafe = function (email) {
  return this.findOne({ email: email.toLowerCase().trim() })
    .select("+password")
    .exec();
};

// ==============================
// 🚀 MODEL REGISTRATION (FIXED: Prevent Overwrite Error)
// ==============================

// ✅ Guard: Only register model if it doesn't already exist
const User = mongoose.models.User || mongoose.model("User", userSchema);

// ==============================
// 🔄 MIGRATION & INITIALIZATION (Moved to server startup)
// ==============================

// These functions are exported for explicit calls in server.js
// They are NOT auto-executed on module import to avoid duplicate runs

async function createDefaultLibrarian() {
  try {
    const existing = await User.findOne({ role: "Librarian" });
    if (existing) {
      if (process.env.NODE_ENV === "development") {
        console.log("ℹ️  Librarian account(s) already exist");
      }
      return;
    }

    const librarian = new User({
      firstName: "Admin",
      lastName: "User",
      email: "admin@library.local",
      staffId: "LIB001",
      password: "Admin@123",
      role: "Librarian",
      isBlocked: false,
    });

    await librarian.save();
    console.log("✅ Default Librarian Created: LIB001 / Admin@123");
    console.log("⚠️  Change these credentials in production!");
  } catch (err) {
    console.warn("⚠️  Could not create default librarian:", err.message);
  }
}

async function migrateExistingUsers() {
  try {
    const result = await User.updateMany(
      { 
        $or: [
          { isBlocked: { $exists: false } },
          { blockedAt: { $exists: false } },
          { blockedBy: { $exists: false } }
        ]
      },
      { $set: { isBlocked: false, blockedAt: null, blockedBy: null } }
    );
    
    if (result.modifiedCount > 0 && process.env.NODE_ENV === "development") {
      console.log(`✅ Migrated ${result.modifiedCount} existing user records`);
    }
  } catch (err) {
    console.warn("⚠️  User migration skipped:", err.message);
  }
}

// ==============================
// 📤 EXPORTS
// ==============================

module.exports = User;
module.exports.createDefaultLibrarian = createDefaultLibrarian;
module.exports.migrateExistingUsers = migrateExistingUsers;