import { style } from "@vanilla-extract/css";

import { vars } from "../../ui/theme.css.ts";

export const shell = style({
  display: "grid",
  gridTemplateColumns: `${vars.size.sidebar} 1fr`,
  minHeight: "100vh",
  "@media": { "screen and (max-width: 720px)": { gridTemplateColumns: "1fr" } },
});

export const sidebar = style({
  background: vars.color.panel,
  borderRight: `1px solid ${vars.color.line}`,
  padding: vars.space.md,
  display: "flex",
  flexDirection: "column",
  gap: vars.space.xs,
  "@media": { "screen and (max-width: 720px)": { flexDirection: "row", flexWrap: "wrap", borderRight: "none", borderBottom: `1px solid ${vars.color.line}` } },
});

export const brand = style({ fontFamily: vars.font.display, fontWeight: 700, padding: vars.space.sm, color: vars.color.ink });

export const workspaceLabel = style({ color: vars.color.ink3, fontSize: vars.size.small, padding: `0 ${vars.space.sm} ${vars.space.md}` });

export const footer = style({ marginTop: "auto", display: "flex", gap: vars.space.xs });

export const main = style({ padding: vars.space.xl, maxWidth: "1100px", width: "100%", "@media": { "screen and (max-width: 720px)": { padding: vars.space.md } } });
