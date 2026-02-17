const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* ==============================
   🔹 MongoDB Connection
================================= */
mongoose.connect("mongodb://127.0.0.1:27017/sdlDB")
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log(err));

/* ==============================
   🔹 Book Schema & Model
================================= */
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: String,
  category: String,
  availableCopies: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

const Book = mongoose.model("Book", bookSchema);

/* ==============================
   🔹 Routes
================================= */

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "Backend Connected to MongoDB 🚀" });
});

// Add Book
app.post("/books", async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json({ message: "Book Added Successfully 📚", book });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Books
app.get("/books", async (req, res) => {
  const books = await Book.find().sort({ createdAt: -1 });
  res.json(books);
});

// Update Book
app.put("/books/:id", async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ message: "Book Updated ✅", updatedBook });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete Book
app.delete("/books/:id", async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Book Deleted ❌" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ==============================
   🔹 Start Server
================================= */
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
