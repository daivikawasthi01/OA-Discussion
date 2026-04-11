// middleware/admin.js
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
};
