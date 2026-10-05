// Service worker: shows web push notifications for blocking inbox items and opens the inbox on click.
self.addEventListener("push", (event) => {
  const message = event.data ? event.data.json() : { title: "work-os", body: "Something needs you.", url: "/" };
  event.waitUntil(self.registration.showNotification(message.title, { body: message.body, data: { url: message.url } }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data.url));
});
