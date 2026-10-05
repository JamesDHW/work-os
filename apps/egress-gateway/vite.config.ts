import { defineConfig } from "vite";

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
