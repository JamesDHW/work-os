import { style } from "@vanilla-extract/css";

import { vars } from "../theme.css.ts";

export const overlay = style({ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.45)" });

export const content = style({
  position: "fixed",
  top: "10vh",
  left: "50%",
  transform: "translateX(-50%)",
  width: "min(640px, calc(100vw - 32px))",
  maxHeight: "80vh",
  overflowY: "auto",
  background: vars.color.surface,
  border: `1px solid ${vars.color.line2}`,
  borderRadius: vars.radius.md,
  padding: vars.space.lg,
  boxShadow: vars.shadow.card,
  display: "flex",
  flexDirection: "column",
  gap: vars.space.md,
});

export const dialogTitle = style({ margin: 0, fontSize: vars.size.title, fontWeight: 600 });
