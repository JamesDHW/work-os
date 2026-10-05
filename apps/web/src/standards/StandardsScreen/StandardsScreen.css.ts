import { style } from "@vanilla-extract/css";

import { vars } from "../../ui/theme.css.ts";

export const standardLink = style({ color: vars.color.ink, fontWeight: 600, fontSize: vars.size.title, textDecoration: "none", selectors: { "&:hover": { color: vars.color.accent } } });

export const standardMeta = style({ color: vars.color.ink3, fontSize: vars.size.small });
