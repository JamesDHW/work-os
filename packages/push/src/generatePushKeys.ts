import type { PushKeys } from "@work-os/core/notifications/PushKeys";
import webPush from "web-push";

export const generatePushKeys = (): PushKeys => webPush.generateVAPIDKeys();
