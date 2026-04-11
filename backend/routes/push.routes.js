const express = require("express");
const router = express.Router();
const PushSubscription = require("../models/Notification");
const auth = require("../middleware/auth.middleware");

router.post("/subscribe", auth, async (req, res) => {
  console.log("✅ PUSH SUB RECEIVED");

  await PushSubscription.findOneAndUpdate(
    { user: req.userId },          // ✅ FIXED
    { subscription: req.body },
    { upsert: true, new: true }
  );

  res.json({ success: true });
});

module.exports = router;
