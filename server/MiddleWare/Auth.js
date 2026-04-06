// Middleware/auth.js
exports.authenticate = (req, res, next) => {
  // 🟢 BYPASS AUTH FOR DEVELOPMENT
  req.user = {
    _id: "dev-unknown",
    email: "dev@library.local",
    role: "Librarian" // Pretend we're a librarian so book routes work
  };
  next();
};