import type { Tokens } from "./Tokens.ts";

export const sharedTokens: Pick<Tokens, "radius" | "font" | "space" | "size"> = {
  radius: { md: "6px", sm: "4px" },
  font: {
    display: "'Inter', -apple-system, 'Segoe UI', sans-serif",
    body: "'Inter', -apple-system, 'Segoe UI', sans-serif",
    mono: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
  },
  space: { xs: "4px", sm: "8px", md: "12px", lg: "20px", xl: "32px" },
  size: { text: "14px", small: "12px", title: "16px", heading: "22px", sidebar: "220px" },
};
