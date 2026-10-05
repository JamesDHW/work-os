import { style } from "@vanilla-extract/css";

import { vars } from "../theme.css.ts";

export const card = style({
  background: vars.color.card,
  border: `1px solid ${vars.color.line}`,
  borderRadius: vars.radius.md,
  padding: vars.space.lg,
  boxShadow: vars.shadow.card,
  display: "flex",
  flexDirection: "column",
  gap: vars.space.md,
});
