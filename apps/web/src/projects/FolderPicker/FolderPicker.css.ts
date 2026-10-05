import { style } from "@vanilla-extract/css";

import { vars } from "../../ui/theme.css.ts";

export const folderPicker = style({ display: "flex", flexDirection: "column", gap: vars.space.sm, padding: vars.space.sm, border: `1px solid ${vars.color.line}`, borderRadius: vars.radius.md });

export const currentPath = style({ fontFamily: vars.font.mono, fontSize: vars.size.small, color: vars.color.ink2, overflowWrap: "anywhere" });

export const folderList = style({ listStyle: "none", margin: 0, padding: 0, maxHeight: "240px", overflow: "auto", display: "flex", flexDirection: "column" });

export const folderButton = style({
  width: "100%",
  textAlign: "left",
  background: "transparent",
  border: "none",
  color: vars.color.ink,
  padding: `${vars.space.xs} ${vars.space.sm}`,
  borderRadius: vars.radius.sm,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
  font: "inherit",
  selectors: { "&:hover": { background: vars.color.surface } },
});
