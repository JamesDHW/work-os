import { style } from "@vanilla-extract/css";

import { vars } from "../../ui/theme.css.ts";

export const connectionList = style({ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: vars.space.sm });

export const connectionRow = style({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: vars.space.md });

export const connectionMeta = style({ color: vars.color.ink3, fontSize: vars.size.small });
