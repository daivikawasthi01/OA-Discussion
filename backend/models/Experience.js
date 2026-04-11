const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema(
  {
    company: String,
    role: String,

    oaPlatform: String,
    difficulty: String,

    questionsCount: Number,

    // 🧠 QUESTION PATTERN (OA TYPE)
    questionPatterns: {
      type: [String],
      set: (arr) =>
        arr
          .flatMap(p => p.split(/[,\s]+/)) // space OR comma
          .map(p => p.trim().toUpperCase())
          .filter(Boolean),
    },

    // 🏷️ TOPICS (DSA / TECH)
    topics: {
      type: [String],
      set: (arr) =>
        arr
          .flatMap(t => t.split(/[,\s]+/))
          .map(t => t.trim().toUpperCase())
          .filter(Boolean),
    },

    experienceText: String,
    rating: Number,
    year: Number,

    // 💰 Salary in LPA
    salaryLPA: {
      type: Number,
      min: 0,
      max: 200,
    },

    isAnonymous: { type: Boolean, default: false },

    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // add below bookmarks
usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

// derived, not stored
// helpedCount = bookmarks.length + usedBy.length



    commentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);
experienceSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Experience", experienceSchema);
