import { apiClient } from "../../api/client.ts";
import { describeFailure } from "../../api/describeFailure.ts";
import { toPushSubscriptionBody } from "./toPushSubscriptionBody.ts";

export const enablePushNotifications = async (): Promise<string | null> => {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return "Notifications are blocked for this site. Allow them in the browser settings.";

  const keyResult = await apiClient.GET("/api/push/public-key");
  if (keyResult.data === undefined) return describeFailure(keyResult) ?? "The server has no push key.";

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyResult.data.publicKey });
  const body = toPushSubscriptionBody(subscription.toJSON());
  if (body === null) return "The browser returned an incomplete push subscription.";

  const saved = await apiClient.POST("/api/push/subscriptions", { body });
  return describeFailure(saved);
};
