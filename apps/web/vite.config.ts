import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The dev server proxies the API to the dev work-os server (pnpm dev:server), which listens on 4311 beside a running install on 4310.
const apiTarget = process.env["WORK_OS_DEV_SERVER_URL"] ?? "http://localhost:4311";

export default defineConfig({
  plugins: [tanstackRouter({ target: "react", autoCodeSplitting: true }), react(), vanillaExtractPlugin()],
  server: { port: 5173, strictPort: true, proxy: { "/api": { target: apiTarget, ws: true } } },
  build: { outDir: "dist", emptyOutDir: true },
});
