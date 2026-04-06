const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String, required: [true, "First name is required"],
      trim: true, minlength: 2,
      match: [/^[a-zA-Z\s'-]+$/, "No special characters or numbers allowed"],
    },
    lastName: {
      type: String, required: [true, "Last name is required"],
      trim: true, minlength: 2,
      match: [/^[a-zA-Z\s'-]+$/, "No special characters or numbers allowed"],
    },
    email: {
      type: String, unique: true, sparse: true, // sparse allows multiple nulls
      lowercase: true, trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Enter a valid email"],
    },
    phone:   { type: String, trim: true },
    staffId: { type: String, unique: true, sparse: true, trim: true },
    role:    { type: String, enum: ["Member", "Librarian"], default: "Member" },

    // ✅ select:false — never returned in queries unless .select("+password")
    password: {
      type: String, required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },

    isBlocked: { type: Boolean, default: false },
    blockedAt: { type: Date,    default: null  },
  },
  { timestamps: true }
);

// ✅ Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt   = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Strip password from all JSON responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.models.User || mongoose.model("User", userSchema);