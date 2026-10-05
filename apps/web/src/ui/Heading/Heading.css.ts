import { style } from "@vanilla-extract/css";

import { vars } from "../theme.css.ts";

export const pageHeading = style({ margin: 0, fontFamily: vars.font.display, fontSize: vars.size.heading, fontWeight: 650 });

export const sectionHeading = style({ margin: 0, fontFamily: vars.font.display, fontSize: vars.size.title, fontWeight: 600 });

export const muted = style({ margin: 0, color: vars.color.ink2 });
