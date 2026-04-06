// Models/Book.js
const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title:           { type: String, required: true, trim: true },
    author:          { type: String, required: true, trim: true },
    isbn:            { type: String, trim: true },
    genre:           { type: String, trim: true },
    publicationYear: { type: Number },
    publisher:       { type: String, default: "Unknown" },
    description:     { type: String, default: "" },
    copiesAvailable: { type: Number, default: 1, min: 0 },
    coverImage:      { type: String, default: null },
  },
  { timestamps: true }
);

// ✅ This one line prevents OverwriteModelError on nodemon restarts
module.exports = mongoose.models.Book || mongoose.model("Book", bookSchema);