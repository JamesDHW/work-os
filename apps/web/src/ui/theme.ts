import { THEME_STORAGE_KEY } from "./theme.constants.ts";

export type ThemeMode = "light" | "dark";

export const setThemeMode = (mode: ThemeMode): void => {
  document.documentElement.dataset["theme"] = mode;
  localStorage.setItem(THEME_STORAGE_KEY, mode);
};

export const readThemeMode = (): ThemeMode => (document.documentElement.dataset["theme"] === "light" ? "light" : "dark");
