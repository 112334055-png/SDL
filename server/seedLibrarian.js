const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./Models/User");

// ✅ CONNECT DB (VERY IMPORTANT)
mongoose.connect("mongodb://127.0.0.1:27017/your_db_name")
  .then(() => console.log("DB connected"))
  .catch(err => console.log(err));

async function createLibrarian() {
  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  const existing = await User.findOne({ staffId: "LIB001" });
  if (existing) {
    console.log("⚠️ Librarian already exists");
    process.exit();
  }

  await User.create({
    firstName: "Admin",
    lastName: "User",
    staffId: "LIB001",
    password: hashedPassword,
    role: "Librarian",
  });

  console.log("✅ Librarian created");
  process.exit();
}

createLibrarian();