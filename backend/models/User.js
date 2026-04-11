const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  googleId: String,
  isVerified: { type: Boolean, default: false },

  followedCompanies: {
    type: [String],
    default: [],
    index: true,
  },

  pushEnabled: { type: Boolean, default: false },

  notificationPrefs: {
    newCompanyOA: { type: Boolean, default: true },
    commentReply: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: true },
  },

  // 🪙 COINS (earned)
  coins: { type: Number, default: 0 },

  // 🏆 LEADERBOARD POINTS
  points: { type: Number, default: 0 },

  lastDailyVisit: { type: Date, default: null },

  role: { type: String, enum: ["user", "admin"], default: "user" },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
