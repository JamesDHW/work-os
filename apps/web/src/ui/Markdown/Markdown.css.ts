import { globalStyle, style } from "@vanilla-extract/css";

import { vars } from "../theme.css.ts";

export const markdown = style({ overflowWrap: "anywhere" });

globalStyle(`${markdown} pre`, { background: vars.color.panel, padding: vars.space.sm, borderRadius: vars.radius.sm, overflowX: "auto" });

globalStyle(`${markdown} p:first-child`, { marginTop: 0 });

globalStyle(`${markdown} p:last-child`, { marginBottom: 0 });
