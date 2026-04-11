self.addEventListener("push", (event) => {
  console.log("🔔 Push received");

  if (!event.data) {
    console.log("❌ No push data");
    return;
  }

  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: "OA Platform", body: event.data.text() };
  }

  const title = data.title || "OA Platform";
  const options = {
    body: data.body || "You have a new notification",
    icon: "/logo.png",
    badge: "/badge.png",
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(url) && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
  );
});
