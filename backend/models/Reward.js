const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  action: {
    type: String,
    enum: [
      "POST_EXPERIENCE",
      "UPVOTE_RECEIVED",
      "COMMENT",            // ✅ ADD THIS
    ],
    required: true,
  },

  points: {
    type: Number,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Reward", rewardSchema);
