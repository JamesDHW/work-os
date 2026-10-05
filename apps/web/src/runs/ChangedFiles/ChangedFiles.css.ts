import { style } from "@vanilla-extract/css";

import { vars } from "../../ui/theme.css.ts";

export const fileList = style({ listStyle: "none", margin: 0, padding: 0, fontFamily: vars.font.mono, fontSize: vars.size.small });

export const changeMark = style({ display: "inline-block", width: "2ch", color: vars.color.accent, fontWeight: 600 });
