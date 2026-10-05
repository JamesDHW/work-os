import { harbourDark } from "@work-os/design-tokens/harbourDark";
import { harbourLight } from "@work-os/design-tokens/harbourLight";
import { createGlobalTheme, createGlobalThemeContract } from "@vanilla-extract/css";

export const vars = createGlobalThemeContract(harbourDark, (_value, path) => `work-os-${path.join("-")}`);

createGlobalTheme(":root", vars, harbourDark);
createGlobalTheme('[data-theme="dark"]', vars, harbourDark);
createGlobalTheme('[data-theme="light"]', vars, harbourLight);
