const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const bookRoutes = require("./Routes/bookRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./Routes/userRoutes");

const app = express();

/* ==============================
   🔹 Middleware
================================= */
app.use(cors());
app.use(express.json());

/* ==============================
   🔹 MongoDB Connection
================================= */
mongoose
  .connect("mongodb://127.0.0.1:27017/sdlDB")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB connection error:", err));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
// Health check
app.get("/", (req, res) => res.json({ message: "Bibliotheca API is running 📚" }));

/* ==============================
   🔹 Start Server
================================= */
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});