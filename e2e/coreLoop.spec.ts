import { expect, test, type Page } from "@playwright/test";
import { spawn, type ChildProcess } from "child_process";
import { mkdir, mkdtemp, readFile, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

import { E2E_SERVER_URL, E2E_SETUP_CODE, RUN_TIMEOUT_MS } from "./e2e.constants.ts";

// The core loop through the browser: first-run setup, pairing a machine, adding a project, a run that changes a file,
// and accepting its review from the inbox. The server runs a scripted model; the runner uses the host driver.

const startedProcesses = new Set<ChildProcess>();

const startRunner = (runnerArguments: readonly string[], dataDirectory: string): ChildProcess => {
  const environment = { ...process.env, WORK_OS_RUNNER_DATA_DIR: dataDirectory, WORK_OS_RUNNER_DRIVER: "unsafeHost", WORK_OS_RUNNER_NAME: "e2e-machine" };
  const child = spawn("node", ["apps/runner/src/main.ts", ...runnerArguments], { env: environment, stdio: "inherit" });
  startedProcesses.add(child);
  return child;
};

const waitForExit = async (child: ChildProcess): Promise<number | null> =>
  new Promise((resolve) => {
    child.once("exit", resolve);
  });

const openSection = async (page: Page, name: string): Promise<void> => {
  await page.getByRole("navigation").getByRole("link", { name, exact: true }).click();
};

const createAccount = async (page: Page): Promise<void> => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/signIn/u);
  await page.getByLabel("Setup code").fill(E2E_SETUP_CODE);
  await page.getByLabel("Your name").fill("Ada");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByRole("button", { name: "Later" }).click();
  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
};

const pairMachine = async (page: Page, dataDirectory: string): Promise<void> => {
  await openSection(page, "Settings");
  await page.getByRole("button", { name: "Pair a machine" }).click();
  const command = await page.getByText("work-os-runner pair").textContent();
  const code = /pair \S+ (\S+)/u.exec(command ?? "")?.[1] ?? "";
  expect(code).not.toBe("");
  expect(await waitForExit(startRunner(["pair", E2E_SERVER_URL, code], dataDirectory))).toBe(0);
  startRunner([], dataDirectory);
  await expect(page.getByText("Online", { exact: true })).toBeVisible({ timeout: 20_000 });
};

const addProject = async (page: Page, projectPath: string): Promise<void> => {
  await openSection(page, "Projects");
  await page.getByRole("button", { name: "Add a project" }).click();
  await page.getByLabel("Folder").fill(projectPath);
  await page.getByLabel("Name", { exact: true }).fill("Demo");
  await page.getByRole("button", { name: "Add project" }).click();
  await expect(page.getByRole("link", { name: "Demo" })).toBeVisible();
};

const runToReview = async (page: Page): Promise<void> => {
  await openSection(page, "Runs");
  await page.getByRole("button", { name: "Start a run" }).click();
  await page.getByLabel("Standard").selectOption("task");
  await page.getByLabel("What should it do?").fill("Write hello.txt");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page).toHaveURL(/\/runs\/[^/]+$/u);
  await expect(page.getByText("In review", { exact: true })).toBeVisible({ timeout: RUN_TIMEOUT_MS });
  await expect(page.getByText("hello.txt").first()).toBeVisible();
};

const acceptReview = async (page: Page): Promise<void> => {
  await openSection(page, "Inbox");
  await page.getByRole("button", { name: "Accept" }).click();
  await page.getByRole("link", { name: "Open the run" }).first().click();
  await expect(page.getByText("Done", { exact: true })).toBeVisible();
};

test.afterAll(() => {
  for (const child of startedProcesses) {
    child.kill();
  }
});

test("a run goes from start to accepted review through the web app", async ({ page }) => {
  const scratch = await mkdtemp(path.join(tmpdir(), "work-os-e2e-"));
  const projectPath = path.join(scratch, "project");
  await mkdir(projectPath);
  await writeFile(path.join(projectPath, "README.md"), "# Demo\n");

  await createAccount(page);
  await pairMachine(page, path.join(scratch, "runner"));
  await addProject(page, projectPath);
  await runToReview(page);
  await acceptReview(page);

  expect(await readFile(path.join(projectPath, "hello.txt"), "utf8")).toBe("hello\n");
});
