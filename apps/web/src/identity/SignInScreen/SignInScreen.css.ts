import { style } from "@vanilla-extract/css";

import { vars } from "../../ui/theme.css.ts";

export const page = style({ minHeight: "100vh", display: "grid", placeItems: "center", padding: vars.space.lg });

export const panel = style({ width: "min(420px, 100%)" });
