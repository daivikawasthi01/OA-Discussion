const mongoose = require("mongoose");

const pushSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
    },
    subscription: {
      endpoint: String,
      keys: {
        p256dh: String,
        auth: String,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PushSubscription", pushSchema);
