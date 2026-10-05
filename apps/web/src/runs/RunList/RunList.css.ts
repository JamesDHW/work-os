import { style } from "@vanilla-extract/css";

import { vars } from "../../ui/theme.css.ts";

export const runList = style({ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: vars.space.xs });

export const runRow = style({
  display: "grid",
  gridTemplateColumns: "auto 1fr auto",
  alignItems: "center",
  gap: vars.space.md,
  padding: `${vars.space.sm} ${vars.space.md}`,
  background: vars.color.card,
  border: `1px solid ${vars.color.line}`,
  borderRadius: vars.radius.md,
  color: vars.color.ink,
  textDecoration: "none",
  selectors: { "&:hover": { borderColor: vars.color.line2 } },
});

export const runText = style({ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });

export const runMeta = style({ color: vars.color.ink3, fontSize: vars.size.small, whiteSpace: "nowrap" });
