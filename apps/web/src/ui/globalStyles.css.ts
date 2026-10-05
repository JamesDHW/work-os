import { globalStyle } from "@vanilla-extract/css";

import { vars } from "./theme.css.ts";

globalStyle("*, *::before, *::after", { boxSizing: "border-box" });

globalStyle("html, body", {
  margin: 0,
  minHeight: "100%",
  background: vars.color.bg,
  color: vars.color.ink,
  fontFamily: vars.font.body,
  fontSize: vars.size.text,
  lineHeight: 1.5,
});

globalStyle("a", { color: vars.color.accent, textDecoration: "none" });

globalStyle("pre, code", { fontFamily: vars.font.mono });
