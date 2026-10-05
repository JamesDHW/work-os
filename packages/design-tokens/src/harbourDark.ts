import { sharedTokens } from "./sharedTokens.ts";
import type { Tokens } from "./Tokens.ts";

// Harbour dark, copied from Atelier's design tokens (resolved from { base: #0D1014, accent: #5E9ED0 }).
export const harbourDark: Tokens = {
  ...sharedTokens,
  color: {
    bg: "#0D1014",
    surface: "#191C20",
    panel: "#13161A",
    card: "#232629",
    card2: "#15181C",
    line: "#282A2E",
    line2: "#424548",
    ink: "#E7E7E8",
    ink2: "#909193",
    ink3: "#737477",
    accent: "#5E9ED0",
    accentInk: "#0F1921",
    accentSoft: "#1D2C3A",
    queued: "#737477",
  },
  status: {
    ok: { base: "#43BE78", soft: "#172F26", solid: "#43BE78", on: "#1C1814", mark: "#43BE78" },
    review: { base: "#F0A52E", soft: "#362B19", solid: "#F0A52E", on: "#1C1814", mark: "#F0A52E" },
    run: { base: "#5AA0E2", soft: "#1B2A39", solid: "#5AA0E2", on: "#1C1814", mark: "#5AA0E2" },
    danger: { base: "#EE5C4E", soft: "#361E1E", solid: "#EE5C4E", on: "#1C1814", mark: "#EE5C4E" },
  },
  shadow: { card: "0 1px 2px rgba(0,0,0,.5), 0 12px 30px rgba(0,0,0,.45)" },
};
