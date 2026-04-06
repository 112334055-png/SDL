// Controllers/bookController.js
const Book = require("../Models/Book");
// Add at the top of bookController.js — these are used in updateBook but never imported
const path = require("path");
const fs = require("fs");

// ── 🔒 STRICT VALIDATION HELPER (Production-Safe) ──────────────────────────

function validateBookInput({
  title,
  author,
  isbn,
  genre,
  publicationYear,
  copies,
  description,
  publisher,
}) {
  const errors = {};

  // ── Regex patterns (strict, no special characters) ──────────────────────
  const nameRegex = /^[a-zA-Z0-9\s.'-]+$/;        // Title: letters, numbers, spaces, . ' -
  const authorRegex = /^[a-zA-Z\s.'-]+$/;         // Author: letters only + spaces, . ' -
  const publisherRegex = /^[a-zA-Z0-9\s.'-,]+$/;  // Publisher: + comma allowed
  const isbnRegex = /^[0-9-]+$/;                  // ISBN: digits and hyphens only

  // ── TITLE ──────────────────────────────────────────────────────────────
  if (!title?.trim()) {
    errors.title = "Title is required";
  } else {
    const t = title.trim();
    if (t.length < 2 || t.length > 200) {
      errors.title = "Title must be 2–200 characters";
    } else if (!nameRegex.test(t)) {
      errors.title = "Title contains invalid characters";
    }
  }

  // ── AUTHOR ─────────────────────────────────────────────────────────────
  if (!author?.trim()) {
    errors.author = "Author is required";
  } else {
    const a = author.trim();
    if (a.length < 2) {
      errors.author = "Author must be at least 2 characters";
    } else if (!authorRegex.test(a)) {
      errors.author = "Author must contain only letters and spaces";
    }
  }

  // ── ISBN ───────────────────────────────────────────────────────────────
  if (!isbn?.trim()) {
    errors.isbn = "ISBN is required";
  } else {
    const clean = isbn.replace(/\s/g, ""); // Remove spaces only, keep hyphens
    if (!isbnRegex.test(clean)) {
      errors.isbn = "ISBN must contain only numbers and hyphens";
    } else {
      const digits = clean.replace(/-/g, "");
      if (![10, 13].includes(digits.length)) {
        errors.isbn = "ISBN must be 10 or 13 digits";
      }
    }
  }

  // ── GENRE ──────────────────────────────────────────────────────────────
  if (!genre?.trim()) {
    errors.genre = "Genre is required";
  }

  // ── PUBLICATION YEAR ───────────────────────────────────────────────────
  if (!publicationYear) {
    errors.publicationYear = "Publication year is required";
  } else {
    const year = parseInt(publicationYear);
    const current = new Date().getFullYear() + 5;
    if (isNaN(year) || year < 1000 || year > current) {
      errors.publicationYear = `Year must be between 1000 - ${current}`;
    }
  }

  // ── PUBLISHER (Optional) ───────────────────────────────────────────────
  if (publisher?.trim()) {
    if (!publisherRegex.test(publisher.trim())) {
      errors.publisher = "Publisher contains invalid characters";
    }
  }

  // ── COPIES ─────────────────────────────────────────────────────────────
  if (!copies) {
    errors.copies = "Copies required";
  } else {
    const c = parseInt(copies);
    if (isNaN(c) || c < 1 || c > 1000) {
      errors.copies = "Copies must be 1–1000";
    }
  }

  // ── DESCRIPTION (Optional, max length) ─────────────────────────────────
  if (description?.trim()?.length > 2000) {
    errors.description = "Description too long";
  }

  return errors;
}

// ── POST /api/books/upload - Add Book ─────────────────────────────────────

// Controllers/bookController.js - uploadBook function

exports.uploadBook = async (req, res) => {
  try {
    // ✅ Safely destructure with defaults
    const { 
      title = "", 
      author = "", 
      isbn = "", 
      genre = "", 
      publicationYear = "", 
      publisher = "", 
      description = "", 
      copies = "1" 
    } = req.body || {};

    console.log("📦 Received form data:", { title, author, isbn, genre });

    // 🔹 Validate input using helper
    const errors = validateBookInput({
      title, author, isbn, genre, publicationYear, copies, description, publisher
    });

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ success: false, errors });
    }

    // 🔹 Normalize ISBN: remove spaces ONLY
    const normalizedIsbn = isbn.replace(/\s/g, "");

    // 🔹 Check duplicate ISBN
    const existing = await Book.findOne({ isbn: normalizedIsbn });
    if (existing) {
      return res.status(409).json({
        success: false,
        errors: { isbn: "A book with this ISBN already exists in the catalog" },
      });
    }

    // 🔹 Handle cover image (from multer)
    let coverImagePath = null;
    if (req.file) {
      coverImagePath = `/uploads/covers/${req.file.filename}`;
      console.log("🖼️ Cover saved:", coverImagePath);
    }

  const book = await Book.create({
  title: title.trim(),
  author: author.trim(),
  isbn: normalizedIsbn,
  genre: genre.trim(),
  publicationYear: parseInt(publicationYear) || new Date().getFullYear(),
  publisher: publisher?.trim() || undefined,
  description: description?.trim() || undefined,
  copiesAvailable: parseInt(copies) || 1,
  coverImage: coverImagePath,
  
  // ✅ FIX: Send null or omit entirely - DO NOT send "unknown" string
  addedBy: null,  // ✅ This is the fix
});
    res.status(201).json({
      success: true,
      message: "Book added to catalog successfully",
      data: {
        id: book._id,
        title: book.title,
        coverImage: book.coverImage,
      },
    });

  } catch (err) {
    console.error("❌ Book upload error:", err);
    
    // Handle MongoDB duplicate key (fallback)
    if (err.code === 11000 && err.keyPattern?.isbn) {
      return res.status(409).json({
        success: false,
        errors: { isbn: "A book with this ISBN already exists" },
      });
    }
    
    res.status(500).json({
      success: false,
      message: err.message || "Failed to add book to catalog",
      debug: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

// ── GET /api/books - List/Search Books ───────────────────────────────────

exports.getAllBooks = async (req, res) => {
  try {
    const { query, page = 1, limit = 20, genre, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (genre) filter.genre = genre;
    if (status) filter.status = status;
    
    if (query?.trim()) {
      // Sanitize search: allow only safe characters
      const sanitized = query.trim().replace(/[^a-zA-Z0-9\s.'-]/g, "");
      if (sanitized.length >= 2) {
        const searchRegex = new RegExp(sanitized, "i");
        filter.$or = [
          { title: { $regex: searchRegex } },
          { author: { $regex: searchRegex } },
          { isbn: { $regex: sanitized.replace(/\s/g, "") } },
        ];
      }
    }

    const [books, total] = await Promise.all([
      Book.find(filter)
        .select("-__v")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Book.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: books.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: books,
    });

  } catch (err) {
    console.error("Fetch books error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch books" });
  }
};

// ── GET /api/books/:id - Get Single Book ─────────────────────────────────

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .select("-__v")
      .populate("addedBy", "firstName lastName role");
      
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }
    
    res.json({ success: true, data: book });
  } catch (err) {
    console.error("Get book error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch book" });
  }
};

// ── PATCH /api/books/:id - Update Book (STRICT VALIDATION) ───────────────

exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    // 🔹 Regex patterns (same as create validation)
    const nameRegex = /^[a-zA-Z0-9\s.'-]+$/;
    const authorRegex = /^[a-zA-Z\s.'-]+$/;
    const publisherRegex = /^[a-zA-Z0-9\s.'-,]+$/;
    const isbnRegex = /^[0-9-]+$/;

    const updates = { ...req.body };
    const errors = {};

    // ── TITLE UPDATE VALIDATION ─────────────────────────────────────────
    if (updates.title !== undefined) {
      const t = updates.title.trim();
      if (!t || t.length < 2 || t.length > 200 || !nameRegex.test(t)) {
        errors.title = "Title must be 2–200 valid characters";
      }
    }

    // ── AUTHOR UPDATE VALIDATION ────────────────────────────────────────
    if (updates.author !== undefined) {
      const a = updates.author.trim();
      if (!a || a.length < 2 || !authorRegex.test(a)) {
        errors.author = "Author must contain only letters and spaces";
      }
    }

    // ── ISBN UPDATE VALIDATION ──────────────────────────────────────────
    if (updates.isbn !== undefined) {
      const clean = updates.isbn.replace(/\s/g, ""); // ✅ No toLowerCase
      if (!isbnRegex.test(clean)) {
        errors.isbn = "ISBN must contain only numbers and hyphens";
      } else {
        const digits = clean.replace(/-/g, "");
        if (![10, 13].includes(digits.length)) {
          errors.isbn = "ISBN must be 10 or 13 digits";
        }
      }
      // Check duplicate ISBN (excluding current book) - ✅ exact match
      const normalized = clean; // ✅ No toLowerCase
      const existing = await Book.findOne({ 
        isbn: normalized,
        _id: { $ne: id }
      });
      if (existing) {
        errors.isbn = "ISBN already used by another book";
      }
    }

    // ── PUBLISHER UPDATE VALIDATION ─────────────────────────────────────
    if (updates.publisher !== undefined && updates.publisher?.trim()) {
      if (!publisherRegex.test(updates.publisher.trim())) {
        errors.publisher = "Publisher contains invalid characters";
      }
    }

    // ── YEAR/COPIES (numeric) ───────────────────────────────────────────
    if (updates.publicationYear !== undefined) {
      const year = parseInt(updates.publicationYear);
      const current = new Date().getFullYear() + 5;
      if (isNaN(year) || year < 1000 || year > current) {
        errors.publicationYear = `Year must be between 1000 - ${current}`;
      }
    }

    if (updates.copies !== undefined) {
      const c = parseInt(updates.copies);
      if (isNaN(c) || c < 0 || c > 1000) {
        errors.copies = "Copies must be 0–1000";
      }
    }

    // ── Return errors if any ────────────────────────────────────────────
    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ success: false, errors });
    }

    // ── Apply sanitized updates ─────────────────────────────────────────
    if (updates.title) book.title = updates.title.trim();
    if (updates.author) book.author = updates.author.trim();
    if (updates.isbn) book.isbn = updates.isbn.replace(/\s/g, ""); // ✅ No toLowerCase
    if (updates.genre) book.genre = updates.genre.trim();
    if (updates.publicationYear) book.publicationYear = parseInt(updates.publicationYear);
    if (updates.publisher !== undefined) book.publisher = updates.publisher?.trim() || null;
    if (updates.description !== undefined) book.description = updates.description?.trim() || null;
    if (updates.copies !== undefined) book.copiesAvailable = parseInt(updates.copies);
    if (updates.status) book.status = updates.status;
    
    // Controllers/bookController.js - In uploadBook, after multer handles the file:

if (req.file) {
  // ✅ Log absolute path for debugging
  const absolutePath = path.join(__dirname, "..", "uploads", "covers", req.file.filename);
  console.log("🖼️ Cover saved:", {
    relativePath: `/uploads/covers/${req.file.filename}`,
    absolutePath: absolutePath,
    exists: fs.existsSync(absolutePath), // ✅ Check if file exists
    size: fs.existsSync(absolutePath) ? fs.statSync(absolutePath).size : "N/A"
  });
  
  coverImagePath = `/uploads/covers/${req.file.filename}`;
}

    await book.save();

    res.json({
      success: true,
      message: "Book updated successfully",
       data:{
        id: book._id,
        title: book.title,
        coverImage: book.coverImage,
      },
    });

  } catch (err) {
    console.error("Update book error:", err);
    
    if (err.code === 11000 && err.keyPattern?.isbn) {
      return res.status(409).json({
        success: false,
        errors: { isbn: "ISBN already used by another book" },
      });
    }
    
    res.status(500).json({ success: false, message: "Failed to update book" });
  }
};

// ── DELETE /api/books/:id - Remove Book ──────────────────────────────────

exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByIdAndDelete(id);
    
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }
    
    res.json({ success: true, message: "Book removed from catalog" });
  } catch (err) {
    console.error("Delete book error:", err);
    res.status(500).json({ success: false, message: "Failed to delete book" });
  }
};