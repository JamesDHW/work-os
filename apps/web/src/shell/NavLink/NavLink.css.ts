import { style } from "@vanilla-extract/css";

import { vars } from "../../ui/theme.css.ts";

export const navLink = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
  padding: `${vars.space.xs} ${vars.space.sm}`,
  borderRadius: vars.radius.sm,
  color: vars.color.ink2,
  selectors: {
    "&:hover": { background: vars.color.card2, color: vars.color.ink },
    '&[data-status="active"]': { background: vars.color.accentSoft, color: vars.color.ink },
  },
});
