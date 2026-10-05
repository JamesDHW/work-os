import { sharedTokens } from "./sharedTokens.ts";
import type { Tokens } from "./Tokens.ts";

// Harbour light, copied from Atelier's design tokens (resolved from { base: #E4E7EA, accent: #225E86 }).
export const harbourLight: Tokens = {
  ...sharedTokens,
  color: {
    bg: "#E4E7EA",
    surface: "#EFF1F3",
    panel: "#F4F5F7",
    card: "#FCFCFC",
    card2: "#D9DBDE",
    line: "#CDD0D3",
    line2: "#B2B4B7",
    ink: "#1B1C1C",
    ink2: "#5B5C5E",
    ink3: "#898B8C",
    accent: "#225E86",
    accentInk: "#FFFFFF",
    accentSoft: "#D9E1E8",
    queued: "#848688",
  },
  status: {
    ok: { base: "#1E9E57", soft: "#D8EAE2", solid: "#1E9E57", on: "#1C1814", mark: "#188448" },
    review: { base: "#E08A1A", soft: "#F1E7DA", solid: "#E08A1A", on: "#1C1814", mark: "#A56614" },
    run: { base: "#2E74C8", soft: "#DAE4F1", solid: "#2E74C8", on: "#FFFFFF", mark: "#2E74C8" },
    danger: { base: "#D83A2C", soft: "#F0DDDD", solid: "#D83A2C", on: "#FFFFFF", mark: "#D83A2C" },
  },
  shadow: { card: "0 1px 2px rgba(40,35,35,.06), 0 9px 22px rgba(40,35,35,.05)" },
};
