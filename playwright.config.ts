import { defineConfig } from "@playwright/test";

import { E2E_SERVER_URL } from "./e2e/e2e.constants.ts";

const chromiumPath = process.env["WORK_OS_CHROMIUM"];
const launchOptions = chromiumPath === undefined ? {} : { launchOptions: { executablePath: chromiumPath } };

export default defineConfig({
  testDir: "e2e",
  timeout: 120_000,
  workers: 1,
  reporter: "list",
  use: { baseURL: E2E_SERVER_URL, trace: "retain-on-failure", ...launchOptions },
  webServer: { command: "scripts/e2e-server.sh", url: `${E2E_SERVER_URL}/api/setup`, timeout: 120_000, reuseExistingServer: false, stdout: "pipe" },
});
