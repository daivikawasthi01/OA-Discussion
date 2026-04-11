const express = require("express");
const router = express.Router();
const Notification = require("../models/inAppNotification");
const auth = require("../middleware/auth.middleware");

/* =========================
   GET MY NOTIFICATIONS
========================= */
router.get("/", auth, async (req, res) => {
  const notifications = await Notification.find({ user: req.userId })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json(notifications);
});

/* =========================
   MARK ALL AS READ
========================= */
router.put("/clear", auth, async (req, res) => {
  const result = await Notification.updateMany(
    { user: req.userId, isRead: false },
    { $set: { isRead: true } }
  );

  res.json({ success: true, modified: result.modifiedCount });
});

/* =========================
   DELETE ALL NOTIFICATIONS
========================= */
router.delete("/all", auth, async (req, res) => {
  const result = await Notification.deleteMany({
    user: req.userId,
  });

  res.json({ success: true, deleted: result.deletedCount });
});

/* =========================
   MARK ONE AS READ
========================= */
router.put("/:id/read", auth, async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { $set: { isRead: true } }
  );

  res.json({ success: true });
});

module.exports = router;
