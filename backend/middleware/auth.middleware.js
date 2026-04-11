const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    // ✅ Read token ONLY from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;

    // ✅ Attach role (for admin routes)
    const user = await User.findById(decoded.id).select("role");
    req.userRole = user?.role || "user";

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
