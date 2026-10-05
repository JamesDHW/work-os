import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

import { vars } from "../../ui/theme.css.ts";

export const transcript = style({ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: vars.space.sm });

export const entryRecipe = recipe({
  base: { borderRadius: vars.radius.md, padding: `${vars.space.sm} ${vars.space.md}`, border: `1px solid ${vars.color.line}`, minWidth: 0 },
  variants: {
    role: {
      user: { background: vars.color.accentSoft, alignSelf: "flex-end", maxWidth: "80%" },
      assistant: { background: vars.color.card },
      tool: { background: vars.color.panel, fontSize: vars.size.small },
    },
    isError: { true: { borderColor: vars.status.danger.base }, false: {} },
  },
});

export const toolSummary = style({ cursor: "pointer", color: vars.color.ink2, fontFamily: vars.font.mono });

export const toolPreview = style({ color: vars.color.ink3 });

export const toolOutput = style({ margin: `${vars.space.sm} 0 0`, whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontFamily: vars.font.mono, maxHeight: "320px", overflow: "auto" });
