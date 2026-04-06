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

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/circulation/my   (Member — own history)
// Query: ?status=pending|approved|rejected|returned
// ─────────────────────────────────────────────────────────────────────────────
exports.getMyRequests = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = { member: req.user._id };
    if (status && ["pending", "approved", "rejected", "returned"].includes(status)) {
      filter.status = status;
    }

    const records = await Circulation.find(filter)
      .sort({ createdAt: -1 })
      .populate(POPULATE);

    return res.status(200).json({ success: true, total: records.length, data: records });
  } catch (err) {
    console.error("[getMyRequests]", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
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
// Approves pending request + decrements copiesAvailable
// ─────────────────────────────────────────────────────────────────────────────
exports.approveRequest = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const record = await Circulation.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }
    if (record.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: `Cannot approve a request that is already "${record.status}"`,
      });
    }

    // Race-condition guard — re-check availability
    const book = await Book.findById(record.book);
    if (!book || book.copiesAvailable < 1) {
      return res.status(409).json({ success: false, message: "No copies available to approve" });
    }

    const now = new Date();
    const [updatedRecord] = await Promise.all([
      Circulation.findByIdAndUpdate(
        record._id,
        {
          status:     "approved",
          actionBy:   req.user._id,
          actionAt:   now,
          approvedAt: now,
          actionNote: req.body.note || "",
        },
        { new: true }
      ).populate(POPULATE),
      Book.findByIdAndUpdate(record.book, { $inc: { copiesAvailable: -1 } }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Request approved. Book copy reserved for member.",
      data:    updatedRecord,
    });
  } catch (err) {
    console.error("[approveRequest]", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/circulation/:id/reject   (Librarian only)
// Body (optional): { note: string }
// ─────────────────────────────────────────────────────────────────────────────
exports.rejectRequest = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const record = await Circulation.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }
    if (record.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: `Cannot reject a request that is already "${record.status}"`,
      });
    }

    const updatedRecord = await Circulation.findByIdAndUpdate(
      record._id,
      {
        status:     "rejected",
        actionBy:   req.user._id,
        actionAt:   new Date(),
        actionNote: req.body.note || "Rejected by librarian",
      },
      { new: true }
    ).populate(POPULATE);

    return res.status(200).json({
      success: true,
      message: "Request rejected.",
      data:    updatedRecord,
    });
  } catch (err) {
    console.error("[rejectRequest]", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
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