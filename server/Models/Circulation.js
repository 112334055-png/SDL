// Models/Circulation.js
const mongoose = require("mongoose");

const circulationSchema = new mongoose.Schema(
  {
    book: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Book",
      required: [true, "Book reference is required"],
    },
    member: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "Member reference is required"],
    },
    requestedReturnDate: {
      type:     Date,
      required: [true, "Requested return date is required"],
    },
    actualReturnDate: { type: Date,   default: null },
    approvedAt:       { type: Date,   default: null },
    status: {
      type:    String,
      enum:    ["pending", "approved", "rejected", "returned"],
      default: "pending",
    },
    actionBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    actionAt:   { type: Date,   default: null },
    actionNote: { type: String, default: "", maxlength: 500 },
  },
  { timestamps: true }
);

circulationSchema.index({ status: 1, createdAt: -1 });
circulationSchema.index({ member: 1, status: 1 });
circulationSchema.index({ book:   1, status: 1 });

// ✅ This one line prevents OverwriteModelError on nodemon restarts
module.exports = mongoose.models.Circulation || mongoose.model("Circulation", circulationSchema);