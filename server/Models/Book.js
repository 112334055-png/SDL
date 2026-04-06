// Models/Book.js
const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Book title is required"],
    trim: true,
    minlength: [2, "Title must be at least 2 characters"],
    maxlength: [200, "Title is too long"],
  },
  author: {
    type: String,
    required: [true, "Author name is required"],
    trim: true,
    minlength: [2, "Author name must be at least 2 characters"],
  },
  isbn: {
    type: String,
    required: [true, "ISBN is required"],
    unique: true,
    trim: true,
    match: [/^[\d-]{10,17}$/, "Enter valid ISBN-10 or ISBN-13"],
  },
  genre: {
    type: String,
    required: [true, "Genre is required"],
    trim: true,
  },
  publicationYear: {
    type: Number,
    required: [true, "Publication year is required"],
    min: [1000, "Year must be after 1000"],
    max: [new Date().getFullYear() + 1, "Year cannot be in the future"],
  },
  publisher: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, "Description too long"],
  },
  copiesAvailable: {
    type: Number,
    required: true,
    min: [0, "Cannot have negative copies"],
    default: 1,
  },
  coverImage: {
    type: String, // Relative path or URL
    trim: true,
  },
 // Models/Book.js - Find the addedBy field and REPLACE it with this:

addedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: false,  // ✅ KEY FIX: Make optional
  default: null,    // ✅ Default to null when no user
},
  status: {
    type: String,
    enum: ["Available", "Borrowed", "Reserved", "Maintenance"],
    default: "Available",
  },
}, { timestamps: true });

// 🔍 Text indexes for search
bookSchema.index({ title: "text", author: "text", isbn: "text" });
bookSchema.index({ genre: 1, status: 1 });

// Remove verbose fields from JSON output
bookSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

// Instance helper
bookSchema.methods.isAvailable = function () {
  return this.copiesAvailable > 0 && this.status === "Available";
};

// Static search method
bookSchema.statics.searchBooks = function (query, options = {}) {
  const filter = {};
  if (query) filter.$text = { $search: query };
  return this.find(filter)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

module.exports = mongoose.model("Book", bookSchema);