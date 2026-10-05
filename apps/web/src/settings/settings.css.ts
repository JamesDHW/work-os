import { style } from "@vanilla-extract/css";

import { vars } from "../ui/theme.css.ts";

export const settingsList = style({ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: vars.space.sm });

export const settingsRow = style({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: vars.space.md, flexWrap: "wrap" });

export const settingsMeta = style({ color: vars.color.ink3, fontSize: vars.size.small });

export const commandText = style({
  margin: 0,
  padding: vars.space.sm,
  background: vars.color.panel,
  borderRadius: vars.radius.sm,
  fontFamily: vars.font.mono,
  fontSize: vars.size.small,
  overflowWrap: "anywhere",
  whiteSpace: "pre-wrap",
});
