// config/push.js
const webpush = require("web-push");

webpush.setVapidDetails(
  "mailto:support@yourdomain.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

module.exports = webpush;
