import { style } from "@vanilla-extract/css";

import { vars } from "../../ui/theme.css.ts";

export const layout = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)",
  gap: vars.space.lg,
  alignItems: "start",
  "@media": { "screen and (max-width: 960px)": { gridTemplateColumns: "minmax(0, 1fr)" } },
});

export const capabilityChip = style({
  fontFamily: vars.font.mono,
  fontSize: vars.size.small,
  padding: `2px ${vars.space.sm}`,
  border: `1px solid ${vars.color.line2}`,
  borderRadius: vars.radius.sm,
  color: vars.color.ink2,
});
