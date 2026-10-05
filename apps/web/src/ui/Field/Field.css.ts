import { style } from "@vanilla-extract/css";

import { vars } from "../theme.css.ts";

export const field = style({ display: "flex", flexDirection: "column", gap: vars.space.xs });

export const fieldLabel = style({ color: vars.color.ink2, fontSize: vars.size.small, fontWeight: 500 });

export const fieldHint = style({ color: vars.color.ink3, fontSize: vars.size.small });

export const control = style({
  background: vars.color.panel,
  color: vars.color.ink,
  border: `1px solid ${vars.color.line2}`,
  borderRadius: vars.radius.sm,
  padding: vars.space.sm,
  font: "inherit",
  width: "100%",
  selectors: { "&:focus": { outline: `2px solid ${vars.color.accent}`, outlineOffset: "-1px" } },
});

export const multiline = style([control, { minHeight: "120px", fontFamily: vars.font.mono, resize: "vertical" }]);
