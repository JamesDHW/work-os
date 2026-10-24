import { defineArchitecture } from "architecture-rules";

// Proposed architecture for work-os (revision 2). ARCHITECTURE.md explains each layer.
const TESTS = ["**/*.test.ts", "**/*.test.tsx"];
const WEB_CONCEPTS = "apps/web/src/{inbox,runs,standards,projects,agents,connections,environments,chiefOfStaff,dashboard,identity,settings}";
const REACT = ["react", "react/jsx-runtime"];
const VANILLA_EXTRACT = ["@vanilla-extract/css", "@vanilla-extract/recipes"];

export default defineArchitecture({
  projects: { tsconfigs: ["tsconfig.json", "apps/web/tsconfig.json"], references: "follow" },
  layers: {
    // ── Foundations ───────────────────────────────────────────────────────────────
    shared: {
      description: "WorkOsError hierarchy and tryCatch.",
      files: ["packages/shared/src/**/*.ts"],
      exclude: TESTS,
      dependencies: { internal: ["shared"] },
    },
    domain: {
      description: "Entity types and pure decisions. No I/O, time, randomness or third-party code.",
      files: ["packages/domain/src/**/*.ts"],
      exclude: TESTS,
      dependencies: { internal: ["domain", "shared"] },
    },
    protocol: {
      description: "Schemas for the HTTP API, the runner link, package file formats and dashboard specs.",
      files: ["packages/protocol/src/**/*.ts"],
      exclude: TESTS,
      dependencies: { internal: ["protocol", "domain", "shared"], external: ["zod"] },
    },
    apiTypes: {
      description: "openapi-typescript output. Regenerate; never edit.",
      files: ["packages/api-types/src/**/*.ts"],
      generated: { reason: "Regenerated from the OpenAPI document by pnpm api-types." },
    },
    config: {
      description: "Runtime configuration schemas and parsing for server, runner and CLI.",
      files: ["packages/config/src/**/*.ts"],
      exclude: TESTS,
      dependencies: { internal: ["config", "shared"], external: ["zod"] },
    },
    designTokens: {
      description: "Token contract and theme values. Pure data, no dependencies.",
      files: ["packages/design-tokens/src/**/*.ts"],
      dependencies: { internal: ["designTokens"] },
    },

    // ── Server ────────────────────────────────────────────────────────────────────
    core: {
      description: "Application logic in flat feature folders; declares the ports it needs.",
      files: ["packages/core/src/**/*.ts"],
      exclude: TESTS,
      dependencies: { internal: ["core", "domain", "shared"], external: ["croner"] },
    },
    api: {
      description: "HTTP routes and middleware over core; emits the OpenAPI document.",
      files: ["packages/api/src/**/*.ts"],
      exclude: TESTS,
      dependencies: {
        internal: ["api", "core", "protocol", "domain", "shared"],
        external: ["hono", "hono/**", "@hono/zod-openapi", "@simplewebauthn/server"],
      },
    },
    db: {
      description: "Seam: Drizzle tables and store implementations of core ports.",
      files: ["packages/db/src/**/*.ts"],
      exclude: TESTS,
      dependencies: { internal: ["db", "core", "domain", "shared"], external: ["drizzle-orm", "drizzle-orm/**", "node:sqlite"] },
    },
    harness: {
      description: "Seam: Pi Durable agent runtime, model access and agent tools.",
      files: ["packages/harness/src/**/*.ts"],
      exclude: TESTS,
      dependencies: {
        internal: ["harness", "core", "protocol", "domain", "shared"],
        external: [
          "@earendil-works/pi-durable",
          "@earendil-works/pi-durable/**",
          "@earendil-works/pi-ai",
          "@earendil-works/pi-ai/**",
          "@earendil-works/chord",
          "@earendil-works/chord/**",
        ],
      },
    },
    secrets: {
      description: "Seam: credential vault (OS keychain master key, AES-GCM at rest).",
      files: ["packages/secrets/src/**/*.ts"],
      exclude: TESTS,
      dependencies: { internal: ["secrets", "core", "shared"], external: ["@napi-rs/keyring", "node:crypto"] },
    },
    push: {
      description: "Seam: web push delivery.",
      files: ["packages/push/src/**/*.ts"],
      exclude: TESTS,
      dependencies: { internal: ["push", "core", "shared"], external: ["web-push"] },
    },
    packageStore: {
      description: "Seam: work-os packages on disk, frontmatter parsing, Git, extension loading.",
      files: ["packages/package-store/src/**/*.ts"],
      exclude: TESTS,
      dependencies: {
        internal: ["packageStore", "core", "sdk", "protocol", "domain", "shared"],
        external: ["yaml", "node:fs/promises", "node:path", "node:child_process"],
      },
    },
    serverApp: {
      description: "Server process: build seams, inject them into core, mount api and the runner link.",
      files: ["apps/server/src/**/*.ts"],
      exclude: TESTS,
      dependencies: {
        internal: ["serverApp", "config", "core", "api", "db", "harness", "secrets", "push", "packageStore", "protocol", "domain", "shared"],
        external: ["hono", "@hono/node-server", "@hono/node-server/**", "@hono/node-ws", "node:process", "node:fs", "node:fs/promises"],
      },
    },

    // ── Runner, gateway, CLI ──────────────────────────────────────────────────────
    sandbox: {
      description: "Seam: environments, tool execution, checks, outputs, host commands, folders, egress control.",
      files: ["packages/sandbox/src/**/*.ts"],
      exclude: TESTS,
      dependencies: {
        internal: ["sandbox", "protocol", "domain", "shared"],
        external: ["node:child_process", "node:fs/promises", "node:path", "node:crypto", "node:os"],
      },
    },
    runnerApp: {
      description: "Runner process: pairing, outbound link, handlers that call sandbox.",
      files: ["apps/runner/src/**/*.ts"],
      exclude: TESTS,
      dependencies: {
        internal: ["runnerApp", "sandbox", "config", "protocol", "domain", "shared"],
        external: ["node:process", "node:fs/promises", "node:path", "node:crypto"],
      },
    },
    egressGateway: {
      description: "Allowlisting proxy: the only route out of a run's container.",
      files: ["apps/egress-gateway/src/**/*.ts"],
      exclude: TESTS,
      dependencies: {
        internal: ["egressGateway", "protocol", "domain", "shared"],
        external: ["node:http", "node:net", "node:process", "node:stream/consumers"],
      },
    },
    cli: {
      description: "work-os command: install services, pair a runner, doctor.",
      files: ["apps/cli/src/**/*.ts"],
      exclude: TESTS,
      dependencies: {
        internal: ["cli", "apiTypes", "config", "domain", "shared"],
        external: [
          "openapi-fetch",
          "node:util", "node:fs/promises", "node:path", "node:os", "node:child_process", "node:process", "node:stream/consumers",
          "node:crypto", "node:readline/promises", "node:timers/promises",
        ],
      },
    },

    // ── Web (Atelier layout) ──────────────────────────────────────────────────────
    webEntry: {
      description: "Mount, theme pre-paint and router instance.",
      files: ["apps/web/src/main.tsx", "apps/web/src/router.tsx"],
      dependencies: { internal: ["webEntry", "webRouteTree", "webUi"], external: [...REACT, "react-dom/client", "@tanstack/react-router"] },
    },
    webRouteTree: {
      description: "Generated by the TanStack Router plugin. Never edit.",
      files: ["apps/web/src/routeTree.gen.ts"],
      naming: { case: "camelCase", suffixes: [".gen"] },
      dependencies: { internal: ["webRoute"], external: ["@tanstack/react-router"] },
      generated: { reason: "Regenerated from src/routes by the TanStack Router plugin on every build." },
    },
    webRoute: {
      description: "Scope-shaped file routes: loaders and screen selection only.",
      files: ["apps/web/src/routes/**/*.tsx"],
      exclude: TESTS,
      naming: { case: "camelCase", allowedNames: ["__root.tsx", "route.tsx", "index.tsx"] },
      dependencies: { internal: ["webScreen", "webShell", "webUi", "webApi"], external: [...REACT, "@tanstack/react-router"] },
    },
    webApi: {
      description: "Per-workspace API client and the SSE subscription that invalidates routes.",
      files: ["apps/web/src/api/**/*.ts"],
      exclude: TESTS,
      dependencies: { internal: ["webApi", "apiTypes"], external: ["openapi-fetch", "@tanstack/react-router"] },
    },
    webShell: {
      description: "App chrome: shell, top bar, sidebar, switchers, command palette.",
      files: ["apps/web/src/shell/**/*.ts", "apps/web/src/shell/**/*.tsx"],
      exclude: TESTS,
      dependencies: { internal: ["webShell", "webUi", "webApi"], external: [...REACT, ...VANILLA_EXTRACT, "@tanstack/react-router", "cmdk"] },
    },
    webScreen: {
      description: "Concept folders of screen components, each Name.tsx + Name.css.ts + Name.hook.ts.",
      files: [`${WEB_CONCEPTS}/**/*.ts`, `${WEB_CONCEPTS}/**/*.tsx`],
      exclude: TESTS,
      dependencies: {
        internal: ["webScreen", "webUi", "webApi"],
        external: [...REACT, ...VANILLA_EXTRACT, "@tanstack/react-router", "react-markdown", "remark-gfm", "shiki", "react-diff-view", "@simplewebauthn/browser"],
      },
    },
    webUi: {
      description: "Primitives and theme layer. A dependency leaf: tokens, vanilla-extract, React, Radix, Tabler.",
      files: ["apps/web/src/ui/**/*.ts", "apps/web/src/ui/**/*.tsx"],
      exclude: TESTS,
      dependencies: {
        internal: ["webUi", "designTokens"],
        external: [...REACT, ...VANILLA_EXTRACT, "@radix-ui/react-dropdown-menu", "@radix-ui/react-popover", "@radix-ui/react-dialog", "@tabler/icons-react", "react-markdown", "remark-gfm"],
      },
    },

    // ── Extension API and bundled work-os packages ────────────────────────────────
    sdk: {
      description: "Public extension API for work-os package developers.",
      files: ["packages/sdk/src/**/*.ts"],
      exclude: TESTS,
      dependencies: { internal: ["sdk", "protocol", "domain", "shared"], external: ["zod"] },
    },
    extension: {
      description: "Extension code in bundled packages: adapters, capabilities, modules, memory stores, trigger sources.",
      files: ["bundled/*/src/**/*.ts"],
      exclude: TESTS,
      dependencies: { internal: ["extension", "sdk"], external: ["zod"] },
    },

    // ── Verification and tooling ──────────────────────────────────────────────────
    test: {
      description: "Colocated unit and hook tests.",
      files: TESTS,
      naming: { case: ["PascalCase", "camelCase"], suffixes: [".test"] },
      rules: {
        "no-captured-mutation": { severity: "off", reason: "Test fakes record the calls they receive, and beforeEach/afterEach share fixture folders." },
        "no-array-mutation": { severity: "off", reason: "Test fakes record the calls they receive by pushing them onto arrays." },
      },
      dependencies: {
        internal: [
          "shared", "domain", "protocol", "config", "core", "api", "db", "harness", "secrets", "push", "packageStore",
          "sandbox", "egressGateway", "cli", "sdk", "extension", "webApi", "webShell", "webScreen", "webUi", "test",
        ],
        external: ["vitest", "@testing-library/react", "zod", "node:fs/promises", "node:path", "node:os"],
      },
    },
    e2e: {
      description: "End-to-end tests against a real server and runner.",
      files: ["e2e/**/*.ts"],
      naming: { case: "camelCase", suffixes: [".spec", ".constants"] },
      rules: {
        "no-captured-mutation": { severity: "off", reason: "The spec records the runner processes it starts so afterAll can stop them." },
        "no-array-mutation": { severity: "off", reason: "Playwright's locator.fill shares a name with Array.prototype.fill; the spec has no arrays to change." },
      },
      dependencies: {
        internal: ["e2e", "apiTypes"],
        external: ["@playwright/test", "openapi-fetch", "node:child_process", "node:fs/promises", "node:os", "node:path"],
      },
    },
    tooling: {
      description: "Build, lint, test and migration configuration.",
      files: ["*.config.ts", "apps/*/vite.config.ts", "packages/db/drizzle.config.ts"],
      naming: { case: "camelCase", suffixes: [".config"] },
      rules: { "max-file-lines": { severity: "off", reason: "Declarative configuration tables; splitting them hides the whole picture." } },
      dependencies: {
        internal: ["e2e"],
        external: [
          "architecture-rules", "oxlint", "oxfmt", "vitest/config", "@playwright/test", "drizzle-kit",
          "vite", "@vitejs/plugin-react", "@vanilla-extract/vite-plugin", "@tanstack/router-plugin/vite",
          "node:path", "node:url",
        ],
      },
    },
  },

  // Project-wide naming and rules; a layer's own settings replace them.
  naming: { case: ["PascalCase", "camelCase"], suffixes: [".test", ".hook", ".constants", ".schema", ".css", ".state"] },
  rules: {
    "unnecessary-conditions": {
      options: { checkTypePredicates: false, allowConstantLoopConditions: "never" },
      reason: "LINT-RULE-FINDINGS §1: checkTypePredicates reports type predicates on unknown, which are the narrowing contract.",
    },
  },
});
