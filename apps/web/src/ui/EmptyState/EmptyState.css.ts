import { style } from "@vanilla-extract/css";

import { vars } from "../theme.css.ts";

export const emptyState = style({
  border: `1px dashed ${vars.color.line2}`,
  borderRadius: vars.radius.md,
  padding: vars.space.xl,
  color: vars.color.ink2,
  textAlign: "center",
});
