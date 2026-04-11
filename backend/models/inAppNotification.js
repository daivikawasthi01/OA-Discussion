// models/inAppNotification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    title: String,
    body: String,

    type: {
      type: String,
      enum: ["LIKE", "COMMENT", "REPLY", "NEW_POST"],
    },

    experienceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Experience",
    },

    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    // ✅ ADD THIS
    url: {
      type: String,
    },

    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
