const Notification = require("../models/inAppNotification");

async function createNotification({
  user,
  type,
  title,
  body,
  url,
}) {
  if (!user) return;

  await Notification.create({
    user,
    type,
    title,
    body,
    url,
  });
}

module.exports = createNotification;
