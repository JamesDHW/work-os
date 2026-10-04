import { defineConfig } from "vite";

// oxlint-disable-next-line import/no-default-export -- Vite loads its configuration from the default export.
export default defineConfig({
  build: {
    ssr: "src/main.ts",
    outDir: "dist",
    target: "node24",
    emptyOutDir: true,
    rollupOptions: { output: { entryFileNames: "gateway.js" } },
  },
  ssr: { noExternal: true },
});
