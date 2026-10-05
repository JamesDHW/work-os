import { style } from "@vanilla-extract/css";

import { vars } from "../theme.css.ts";

export const pageHeader = style({ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: vars.space.md, flexWrap: "wrap", marginBottom: vars.space.lg });

export const titles = style({ display: "flex", flexDirection: "column", gap: vars.space.xs });
