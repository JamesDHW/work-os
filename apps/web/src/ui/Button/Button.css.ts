import { recipe } from "@vanilla-extract/recipes";

import { vars } from "../theme.css.ts";

export const buttonRecipe = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: vars.space.xs,
    border: `1px solid ${vars.color.line2}`,
    borderRadius: vars.radius.md,
    padding: `${vars.space.xs} ${vars.space.md}`,
    font: "inherit",
    fontWeight: 500,
    cursor: "pointer",
    background: vars.color.card,
    color: vars.color.ink,
    selectors: { "&:disabled": { opacity: 0.5, cursor: "default" } },
  },
  variants: {
    tone: {
      primary: { background: vars.color.accent, borderColor: vars.color.accent, color: vars.color.accentInk },
      secondary: {},
      danger: { background: vars.status.danger.soft, borderColor: vars.status.danger.base, color: vars.status.danger.base },
      ghost: { background: "transparent", borderColor: "transparent", color: vars.color.ink2 },
    },
  },
  defaultVariants: { tone: "secondary" },
});
