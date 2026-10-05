import { style } from "@vanilla-extract/css";

import { vars } from "../theme.css.ts";

export const checkboxLabel = style({ display: "inline-flex", alignItems: "center", gap: vars.space.sm, color: vars.color.ink, cursor: "pointer" });

export const checkbox = style({ accentColor: vars.color.accent, width: "16px", height: "16px" });
