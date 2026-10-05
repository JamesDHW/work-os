import { style } from "@vanilla-extract/css";

import { vars } from "../theme.css.ts";

export const errorNotice = style({
  background: vars.status.danger.soft,
  color: vars.status.danger.mark,
  border: `1px solid ${vars.status.danger.base}`,
  borderRadius: vars.radius.sm,
  padding: vars.space.sm,
});
