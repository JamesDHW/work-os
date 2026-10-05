import { style } from "@vanilla-extract/css";

import { vars } from "../../ui/theme.css.ts";

export const projectLink = style({ color: vars.color.ink, fontWeight: 600, fontSize: vars.size.title, textDecoration: "none", selectors: { "&:hover": { color: vars.color.accent } } });

export const projectPath = style({ fontFamily: vars.font.mono, fontSize: vars.size.small, color: vars.color.ink3, overflowWrap: "anywhere" });
