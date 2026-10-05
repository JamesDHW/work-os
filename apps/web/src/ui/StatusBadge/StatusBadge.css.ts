import { recipe } from "@vanilla-extract/recipes";

import { vars } from "../theme.css.ts";

export const statusBadgeRecipe = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: vars.space.xs,
    borderRadius: "999px",
    padding: `1px ${vars.space.sm}`,
    fontSize: vars.size.small,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  variants: {
    tone: {
      ok: { background: vars.status.ok.soft, color: vars.status.ok.mark },
      review: { background: vars.status.review.soft, color: vars.status.review.mark },
      run: { background: vars.status.run.soft, color: vars.status.run.mark },
      danger: { background: vars.status.danger.soft, color: vars.status.danger.mark },
      queued: { background: vars.color.card2, color: vars.color.queued },
    },
  },
});
