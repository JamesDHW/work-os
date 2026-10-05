import { recipe } from "@vanilla-extract/recipes";

import { vars } from "../theme.css.ts";

export const stackRecipe = recipe({
  base: { display: "flex", minWidth: 0 },
  variants: {
    direction: { column: { flexDirection: "column" }, row: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" } },
    gap: { sm: { gap: vars.space.sm }, md: { gap: vars.space.md }, lg: { gap: vars.space.lg } },
    justify: { start: { justifyContent: "flex-start" }, between: { justifyContent: "space-between" }, end: { justifyContent: "flex-end" } },
  },
  defaultVariants: { direction: "column", gap: "md", justify: "start" },
});
