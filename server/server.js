const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const bookRoutes = require("./Routes/bookRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./Routes/userRoutes");
const circulationRoutes = require("./Routes/CirculationRoutes"); // ← NEW

const app = express();
const PORT = 5000;

/* ==============================
   🔹 CORS — MUST be first middleware
================================= */
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

/* ==============================
   🔹 Body parsers
================================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ==============================
   🔹 MongoDB
================================= */
mongoose
  .connect("mongodb://127.0.0.1:27017/sdlDB")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.error("MongoDB error:", err));

/* ==============================
   🔹 Static uploads
================================= */
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Created uploads directory");
}

app.use("/uploads", express.static(uploadsDir));
console.log("📁 Serving uploads from:", uploadsDir);
console.log("📁 Covers dir exists:", fs.existsSync(path.join(uploadsDir, "covers")));

/* ==============================
   🔹 API Routes
================================= */
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/circulation", circulationRoutes); // ← NEW

/* ==============================
   🔹 Health Check
================================= */
app.get("/", (req, res) =>
  res.json({ message: "Bibliotheca API is running 📚" })
);

/* ==============================
   🔹 Start Server
================================= */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🖼️  Test image: http://localhost:${PORT}/uploads/covers/your-image.png`);
});