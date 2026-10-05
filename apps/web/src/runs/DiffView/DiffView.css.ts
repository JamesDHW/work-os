import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

import { vars } from "../../ui/theme.css.ts";

export const diffView = style({
  margin: 0,
  padding: vars.space.sm,
  background: vars.color.panel,
  border: `1px solid ${vars.color.line}`,
  borderRadius: vars.radius.md,
  fontFamily: vars.font.mono,
  fontSize: vars.size.small,
  overflow: "auto",
  maxHeight: "560px",
});

export const diffLineRecipe = recipe({
  base: { display: "block", whiteSpace: "pre", minHeight: "1.4em" },
  variants: {
    kind: {
      header: { color: vars.color.ink3, fontWeight: 600 },
      hunk: { color: vars.status.run.base },
      added: { background: vars.status.ok.soft, color: vars.status.ok.base },
      removed: { background: vars.status.danger.soft, color: vars.status.danger.base },
      context: { color: vars.color.ink2 },
    },
  },
});
