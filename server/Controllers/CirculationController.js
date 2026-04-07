// controllers/circulationController.js
const mongoose   = require("mongoose");
const Circulation = require("../Models/Circulation");
const Book        = require("../Models/Book");

// ── Helper ────────────────────────────────────────────────────────────────────
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Populate fields reused across every handler
const POPULATE = [
  { path: "book",     select: "title author genre coverImage isbn copiesAvailable" },
  { path: "member",   select: "firstName lastName email" },
  { path: "actionBy", select: "firstName lastName" },
];

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/circulation/request
// Member submits a borrow request.
// Body: { bookId, requestedReturnDate }
// ─────────────────────────────────────────────────────────────────────────────
exports.createRequest = async (req, res) => {
  try {
    const { bookId, requestedReturnDate } = req.body;

    if (!bookId || !requestedReturnDate) {
      return res.status(400).json({
        success: false,
        message: "bookId and requestedReturnDate are required",
      });
    }

    if (!isValidId(bookId)) {
      return res.status(400).json({ success: false, message: "Invalid bookId" });
    }

    const returnDate = new Date(requestedReturnDate);
    if (isNaN(returnDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid return date format" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (returnDate <= today) {
      return res.status(400).json({ success: false, message: "Return date must be in the future" });
    }

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    if (returnDate > maxDate) {
      return res.status(400).json({ success: false, message: "Maximum borrowing period is 30 days" });
    }

    // Check book exists and has copies
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }
    if (book.copiesAvailable < 1) {
      return res.status(409).json({ success: false, message: "No copies available for this book" });
    }

    // Prevent duplicate active requests
    const existing = await Circulation.findOne({
      book:   bookId,
      member: req.user._id,
      status: { $in: ["pending", "approved"] },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          existing.status === "pending"
            ? "You already have a pending request for this book"
            : "You currently have this book checked out",
      });
    }

    const circulation = await Circulation.create({
      book:                bookId,
      member:              req.user._id,
      requestedReturnDate: returnDate,
      status:              "pending",
    });

    await circulation.populate(POPULATE);

    return res.status(201).json({
      success: true,
      message: "Borrow request submitted. Awaiting librarian approval.",
      data:    circulation,
    });
  } catch (err) {
    console.error("[createRequest]", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/circulation/all   (Librarian only)
// Query: ?status=pending|approved|rejected|returned  &page=1  &limit=50
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (status && ["pending", "approved", "rejected", "returned"].includes(status)) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [records, total] = await Promise.all([
      Circulation.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate(POPULATE),
      Circulation.countDocuments(filter),
    ]);

    return res.status(200).json({
      success:    true,
      total,
      page:       parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data:       records,
    });
  } catch (err) {
    console.error("[getAllRequests]", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const requests = await Circulation.find({ member: req.user._id })
      .populate("book", "title author genre coverImage copiesAvailable")
      .populate("actionBy", "firstName lastName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests,
    });

  } catch (err) {
    console.error("❌ Get my requests error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch borrow requests"
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/circulation/:id   (Member sees own; Librarian sees all)
// ─────────────────────────────────────────────────────────────────────────────
exports.getRequestById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const record = await Circulation.findById(req.params.id).populate(POPULATE);

    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    if (
      req.user.role !== "Librarian" &&
      record.member._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    return res.status(200).json({ success: true, data: record });
  } catch (err) {
    console.error("[getRequestById]", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/circulation/:id/approve   (Librarian only)
// Controllers/CirculationController.js

exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    // ✅ FIX: Destructure with default empty string for note
    const { note = "" } = req.body || {};

    const request = await Circulation.findById(id)
      .populate("book")
      .populate("member", "firstName lastName email");

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ 
        success: false, 
        message: `Can only approve pending requests (current status: ${request.status})` 
      });
    }

    // ✅ Check book availability
    if (request.book?.copiesAvailable < 1) {
      return res.status(400).json({ 
        success: false, 
        message: "Book is currently unavailable" 
      });
    }

    // ✅ Update request status
    request.status = "approved";
    request.actionBy = req.user?._id || "system"; // Handle missing auth
    request.actionAt = new Date();
    request.actionNote = note || "Approved by librarian";

    // ✅ Decrement book copies
    request.book.copiesAvailable -= 1;
    await request.book.save();
    await request.save();

    res.json({
      success: true,
      message: "Request approved successfully",
      data: {
        id: request._id,
        status: request.status,
        actionNote: request.actionNote,
        book: {
          id: request.book._id,
          title: request.book.title,
          copiesAvailable: request.book.copiesAvailable,
        },
      },
    });

  } catch (err) {
    console.error("❌ Approve request error:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to approve request" 
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/circulation/:id/reject   (Librarian only)
// Body (optional): { note: string }
// ─────────────────────────────────────────────────────────────────────────────
// rejectRequest
exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { note = "Rejected by librarian" } = req.body || {}; // ✅ Default note

    const request = await Circulation.findById(id)
      .populate("book")
      .populate("member", "firstName lastName email");

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ 
        success: false, 
        message: `Can only reject pending requests (current status: ${request.status})` 
      });
    }

    request.status = "rejected";
    request.actionBy = req.user?._id || "system";
    request.actionAt = new Date();
    request.actionNote = note;

    await request.save();

    res.json({
      success: true,
      message: "Request rejected",
      data: { id: request._id, status: request.status, actionNote: request.actionNote },
    });

  } catch (err) {
    console.error("❌ Reject request error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to reject request" });
  }
};
// Controllers/CirculationController.js


// returnRequest
exports.returnRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { note = "" } = req.body || {}; // ✅ Safe destructuring

    const request = await Circulation.findById(id)
      .populate("book")
      .populate("member", "firstName lastName email");

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (request.status !== "approved") {
      return res.status(400).json({ 
        success: false, 
        message: `Can only return approved requests (current status: ${request.status})` 
      });
    }

    // ✅ Increment book copies
    request.book.copiesAvailable += 1;
    await request.book.save();

    request.status = "returned";
    request.actionBy = req.user?._id || "system";
    request.actionAt = new Date();
    request.actualReturnDate = new Date();
    request.actionNote = note || "Book returned";

    await request.save();

    res.json({
      success: true,
      message: "Book marked as returned",
      data: {
        id: request._id,
        status: request.status,
        book: {
          id: request.book._id,
          title: request.book.title,
          copiesAvailable: request.book.copiesAvailable,
        },
      },
    });

  } catch (err) {
    console.error("❌ Return request error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to process return" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/circulation/:id/return   (Librarian only)
// Marks approved borrow as returned + increments copiesAvailable
// ─────────────────────────────────────────────────────────────────────────────
exports.markReturned = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const record = await Circulation.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }
    if (record.status !== "approved") {
      return res.status(409).json({
        success: false,
        message: `Cannot mark as returned — current status is "${record.status}"`,
      });
    }

    const now = new Date();
    const [updatedRecord] = await Promise.all([
      Circulation.findByIdAndUpdate(
        record._id,
        {
          status:           "returned",
          actualReturnDate: now,
          actionBy:         req.user._id,
          actionAt:         now,
          actionNote:       req.body.note || "",
        },
        { new: true }
      ).populate(POPULATE),
      Book.findByIdAndUpdate(record.book, { $inc: { copiesAvailable: 1 } }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Book marked as returned. Copy restored to catalog.",
      data:    updatedRecord,
    });
  } catch (err) {
    console.error("[markReturned]", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/circulation/:id
// Member cancels their own PENDING request only
// ─────────────────────────────────────────────────────────────────────────────
exports.cancelRequest = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const record = await Circulation.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    const isOwner     = record.member.toString() === req.user._id.toString();
    const isLibrarian = req.user.role === "Librarian";

    if (!isOwner && !isLibrarian) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    if (record.status !== "pending") {
      return res.status(409).json({ success: false, message: "Only pending requests can be cancelled" });
    }

    await Circulation.findByIdAndDelete(record._id);

    return res.status(200).json({ success: true, message: "Request cancelled successfully" });
  } catch (err) {
    console.error("[cancelRequest]", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};