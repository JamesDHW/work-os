import { style } from "@vanilla-extract/css";

import { vars } from "../../ui/theme.css.ts";

export const callList = style({ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: vars.space.sm });

export const callRow = style({ display: "flex", flexDirection: "column", gap: vars.space.xs, padding: vars.space.sm, background: vars.color.panel, borderRadius: vars.radius.sm });

export const callResult = style({ margin: 0, fontFamily: vars.font.mono, fontSize: vars.size.small, whiteSpace: "pre-wrap", overflowWrap: "anywhere", color: vars.color.ink2 });
