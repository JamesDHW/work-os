import { defineConfig } from "drizzle-kit";

// oxlint-disable-next-line import/no-default-export -- drizzle-kit loads its configuration from the default export.
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/tables/*.ts",
  out: "./migrations",
});
