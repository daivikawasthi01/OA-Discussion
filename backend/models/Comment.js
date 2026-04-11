const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    experience: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Experience",
      required: true,
    },

    // 🔁 REPLY SYSTEM (Instagram style)
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null, // null = top-level comment
    },

    // ❤️ LIKES
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // 👎 DISLIKES (optional)
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ⚡ COUNTERS (for fast sorting)
    likeCount: {
      type: Number,
      default: 0,
      index: true,
    },

    replyCount: {
      type: Number,
      default: 0,
    },

    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// 🚀 INDEXES FOR PERFORMANCE
commentSchema.index({ experience: 1, likeCount: -1 });
commentSchema.index({ parentComment: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", commentSchema);
