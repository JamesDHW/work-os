import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

import { SERVER_EVENT_NAMES } from "./shell.constants.ts";

export const useServerEvents = (workspaceId: string): void => {
  const router = useRouter();

  useEffect(() => {
    const source = new EventSource(`/api/w/${workspaceId}/events`, { withCredentials: true });
    const invalidate = (): void => {
      void router.invalidate();
    };
    for (const eventName of SERVER_EVENT_NAMES) {
      source.addEventListener(eventName, invalidate);
    }
    return () => source.close();
  }, [router, workspaceId]);
};
