import { style } from "@vanilla-extract/css";

import { vars } from "../../ui/theme.css.ts";

export const meta = style({ color: vars.color.ink3, fontSize: vars.size.small });

export const title = style({ fontWeight: 600, fontSize: vars.size.title });

export const argumentList = style({
  margin: 0,
  padding: vars.space.sm,
  background: vars.color.panel,
  borderRadius: vars.radius.sm,
  fontFamily: vars.font.mono,
  fontSize: vars.size.small,
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
});
