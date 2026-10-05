import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { apiClient } from "../../api/client.ts";
import { startAction } from "../../api/startAction.ts";
import { readThemeMode, setThemeMode, type ThemeMode } from "../../ui/theme.ts";
import { useServerEvents } from "../useServerEvents.ts";

export type AppShellModel = {
  readonly themeMode: ThemeMode;
  readonly handleThemeClick: () => void;
  readonly handleSignOutClick: () => void;
};

export const useAppShell = (workspaceId: string): AppShellModel => {
  const navigate = useNavigate();
  const [themeMode, setThemeModeState] = useState<ThemeMode>(readThemeMode);
  useServerEvents(workspaceId);

  const handleThemeClick = (): void => {
    const nextMode = themeMode === "dark" ? "light" : "dark";
    setThemeMode(nextMode);
    setThemeModeState(nextMode);
  };

  const signOut = async (): Promise<void> => {
    await apiClient.DELETE("/api/session");
    await navigate({ to: "/signIn" });
  };

  return { themeMode, handleThemeClick, handleSignOutClick: startAction(signOut) };
};
