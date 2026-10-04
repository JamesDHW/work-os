import { defineConfig } from "vitest/config";

// oxlint-disable-next-line import/no-default-export -- Vitest loads its configuration from the default export.
export default defineConfig({
  test: {
    include: ["packages/*/src/**/*.test.ts", "apps/*/src/**/*.test.ts", "apps/*/src/**/*.test.tsx", "bundled/*/src/**/*.test.ts"],
    environment: "node",
  },
});
