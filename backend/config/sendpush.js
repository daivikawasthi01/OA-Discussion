const webpush = require("./push");
const PushSubscription = require("../models/Notification");

async function sendPush(userId, payload) {
  console.log("🚀 sendPush called for user:", userId);

  const sub = await PushSubscription.findOne({ user: userId });

  if (!sub) {
    console.log("❌ No subscription found for user");
    return;
  }

  console.log("✅ Subscription found");
  console.log("📦 Payload:", payload);

  try {
    await webpush.sendNotification(
      sub.subscription,
      JSON.stringify(payload)
    );
    console.log("✅ webpush.sendNotification SUCCESS");
  } catch (err) {
    console.error("❌ webpush.sendNotification FAILED");
    console.error("Status:", err.statusCode);
    console.error("Message:", err.body || err.message);

    // 🔥 Clean up invalid subscriptions
    if (err.statusCode === 404 || err.statusCode === 410) {
      console.log("🧹 Removing invalid subscription");
      await PushSubscription.deleteOne({ _id: sub._id });
    }
  }
}

module.exports = sendPush;
