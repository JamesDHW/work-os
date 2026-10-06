# Lint report — one-shot v1 build

`architecture-check` (architecture-rules on oxlint) ran after every slice of the build, and every milestone was committed with zero errors and zero warnings. The final tree is clean across 574 TypeScript files in two TypeScript programs (`tsconfig.json` and `apps/web/tsconfig.json`).

The counts below come from the checker output captured in the build log. They are a lower bound: some runs were piped through `head` or `tail`, and a finding fixed and seen again later counts once per file and line.

## Findings fixed during the build

| Rule id | Reported as | Findings | How they were fixed |
| --- | --- | ---: | --- |
| no-deep-relative-imports | architecture/no-deep-relative-imports | 45 | Web routes import through a `#web/*` subpath import instead of `../../../../`. |
| no-misused-promises | typescript/no-misused-promises | 29 | Wrapped in a `startAction` helper during the build. After the build, architecture-rules stopped checking JSX props for this (React ignores a handler's return value), and the wrapper was deleted. |
| named-jsx-handlers | architecture/named-jsx-handlers | 22 | Curried `onClick={handle(id)}` became one named handler that reads the row id from the element's `value` or `name`. |
| control-flow-braces | architecture/control-flow-braces | 20 | Braces on non-terminal single-line `if` statements. |
| named-predicates | architecture/named-predicates | 15 | Compound conditions became named constants (`const hasArguments = …`). |
| explicit-exported-return-types | typescript/explicit-module-boundary-types | 12 | Return types on exported factories and hooks. |
| pure-conditions | architecture/pure-conditions | 8 | `await` and construction moved out of `??` and ternaries into their own statements. |
| generic-name-denylist | eslint/id-denylist | 7 | Renamed (`item` → `inboxItem`, `data` → the thing it holds). Three remain as suppressions where an external API names the field `data`. |
| readonly-type-properties | architecture/readonly-type-properties | 6 | `readonly` on type properties. |
| one-path-one-result | architecture/one-path-one-result | 5 | Single return path per branch. |
| simple-ternaries | architecture/simple-ternaries | 5 | Nested ternaries became guards or switches. |
| explicit-jsx-props | react/jsx-props-no-spreading | 5 | Route components pass each screen prop by name. |
| allowed-imports | architecture/allowed-imports | 4 | Moved code to the layer allowed to import it, or widened a file type in the configuration (listed below). |
| no-unsafe-return | typescript/no-unsafe-return | 4 | Parsed through a schema before returning. |
| prefer-switch | architecture/prefer-switch | 3 | `if` chains on one discriminant became `switch`. |
| terminal-switch-cases | architecture/terminal-switch-cases | 2 | Every case returns. |
| no-type-assertions | architecture/no-type-assertions | 2 | Replaced by schema parsing; two remain as reasoned brand suppressions. |
| no-unsafe-type-assertion | typescript/no-unsafe-type-assertion | 2 | Same as above. |
| no-unsafe-member-access | typescript/no-unsafe-member-access | 2 | Narrowed `unknown` before reading. |
| no-binding-alias | architecture/no-binding-alias | 2 | Removed the alias and used the original name. |
| prefer-arrow-functions | func-style | 1 | Arrow function. |
| max-file-lines-warn | architecture/max-file-lines-warn | 1 | File split. |
| no-raw-exceptions | architecture/no-raw-exceptions | 1 | `try` replaced by `tryCatchAsync`. |
| no-unsafe-assignment | typescript/no-unsafe-assignment | 1 | Typed through a schema. |
| explicit-conditions | typescript/strict-boolean-expressions | 1 | Explicit comparison. |
| no-unsafe-argument | typescript/no-unsafe-argument | 1 | Typed through a schema. |
| async-await | promise/prefer-await-to-then | 1 | `await` instead of `.then`. |
| constants-module | architecture/constants-module | 1 | Moved to a `*.constants.ts` file. |
| switch-exhaustiveness | typescript/switch-exhaustiveness-check | 1 | Added `case undefined` to the CLI command switch. |

### Generated code

The TanStack Router route tree and the OpenAPI types are file types marked `generated: { reason }` (added to architecture-rules after the build). They are still classified, named, import-checked and type-checked, but never linted, and their generators' file-wide disables are not checked. During the build they needed 13 rule overrides and a replaced plugin header instead.

## Every suppression

There are 13 `oxlint-disable-next-line` comments. (There were 18; the five default-export suppressions in configuration files went when architecture-rules started exempting `*.config.ts` files from `named-exports`.) Each names its rule and gives the concrete reason.

| File | Rule | Reason |
| --- | --- | --- |
| `packages/shared/src/tryCatch.ts:6` | `architecture/no-raw-exceptions` | `tryCatch` is the one place that converts thrown values into `WorkOsError`. |
| `packages/shared/src/tryCatch.ts:15` | `architecture/no-raw-exceptions` | `tryCatchAsync` is the one place that converts rejections into `WorkOsError`. |
| `apps/web/src/api/captureFailure.ts:4` | `architecture/no-raw-exceptions` | Browser APIs such as WebAuthn report cancellation by throwing; this adapter turns that into a message. |
| `apps/web/src/routes/index.tsx:9` | `architecture/no-raw-exceptions` | TanStack Router redirects from `beforeLoad` by throwing the redirect. |
| `apps/web/src/routes/index.tsx:11` | `architecture/no-raw-exceptions` | Same. |
| `apps/web/src/routes/w/$workspaceId/route.tsx:19` | `architecture/no-raw-exceptions` | TanStack Router redirects from loaders by throwing the redirect. |
| `apps/web/src/router.tsx:8` | `typescript/consistent-type-definitions` | TanStack Router registers the router type through interface merging. |
| `packages/api/src/events/writeEvent.ts:4` | `eslint/id-denylist` | Hono's server-sent event message names its payload field `data`. |
| `packages/api/src/runners/runnerLinkRoute.ts:9` | `eslint/id-denylist` | WebSocket message events name their payload field `data`. |
| `packages/protocol/src/common/openAiModelList.schema.ts:4` | `eslint/id-denylist` | OpenAI-compatible model lists name this field `data`. |
| `packages/domain/src/identifiers/Branded.ts:4` | `architecture/no-type-assertions`, `typescript/no-unsafe-type-assertion` | Attaching a brand to an already validated string is this function's only purpose. |
| `packages/harness/src/runs/toConversationId.ts:8` | `architecture/no-type-assertions`, `typescript/no-unsafe-type-assertion` | Pi Durable brands conversation ids and exports no constructor; this text came from `createConversation`. |
| `packages/package-store/src/extensions/loadExtension.ts:18` | `architecture/allowed-imports` | Bundled extensions are named in `workos.yaml`, so their entry path is only known at runtime. |

By kind: six thrown-value boundaries (two of them `tryCatch` itself, three TanStack redirects, one WebAuthn adapter), three external `data` fields, two brand constructors, one interface merge and one runtime import.

## Rules that never fired

No finding from these rules appeared in the build log. Some of them were never tested because the code avoided the construct from the start (STYLE.md bans `let`, `else`, loops other than `for…of` and `.then`). Others are structural checks that only fire on a misconfigured project.

- **Structural and compiler:** `checked-indexed-access`, `compiler-checking`, `exact-optional-property-types`, `file-classification`, `file-inventory`, `file-naming`, `force-consistent-casing-in-file-names`, `no-fallthrough-cases-in-switch`, `no-implicit-override`, `no-implicit-returns`, `project-membership`, `strict-typescript`. Compiler errors surfaced through `tsc` instead.
- **Style the code already followed:** `collection-loops`, `guard-clauses`, `no-else`, `no-loop-jumps`, `no-finally`, `no-for-each`, `reduce-simple-folds`, `no-var`, `prefer-const`, `prefer-arrow-callback`, `no-param-reassign`, `no-enums`, `no-boolean-if-else`, `no-boolean-assignment-branches`, `no-boolean-cast`, `no-collapsible-if`, `no-unneeded-ternary`, `prefer-logical-over-ternary`, `prefer-single-boolean-return`, `subject-first-comparisons`, `scoped-case-declarations`, `no-duplicate-switch-cases`, `no-empty-branches`, `named-divisibility`, `grouped-logical-operators`, `nullish-defaults`, `prefer-at`, `eqeqeq`, `direct-boolean-conditions`, `neutral-collection-results`, `no-useless-assignment`, `no-unreachable-statements`, `explicit-conditional-effects`, `unnecessary-conditions`, `exhaustive-value-mappings`, `domain-owned-dispatch`, `preserve-cleanup-failures`.
- **Safety rules with no violations:** `await-thenable`, `no-floating-promises`, `no-non-null-assertion`, `no-ts-comments`, `no-unsafe-call`, `no-cycle`.
- **React:** `exhaustive-deps`, `jsx-key`, `module-scope-components`, `rules-of-hooks`.
- **Not reached:** `named-exports` (configuration files are exempt) and `max-file-lines` (no file reached the error limit; one reached the warning limit).

## Rules added after the build

- `no-let`, `no-captured-mutation` (with `*.state.ts` modules as the one place for long-lived state), `no-array-mutation`, `destructured-props` and `no-shadow` were added to architecture-rules after the build, and work-os was changed to pass them. `named-jsx-handlers` now accepts a call whose arguments are all plain values.

## Configuration overrides

Each override is also logged with its reason in `BUILD-NOTES.md`.

- `defaults.rules["unnecessary-conditions"]`: `checkTypePredicates: false`. Type predicates over `unknown` are the narrowing contract at boundaries (decided before the build).
- `projects.tsconfigs` += `apps/web/tsconfig.json`.
- Import widenings: `test` += `zod`; `harness` += `@earendil-works/*/**`; `serverApp` += `@hono/node-server/**` and `fs/promises`; `egressGateway` internal += `domain`; `runnerApp` builtins += `process`, `fs/promises`, `path`, `crypto`; `webUi` += `react-markdown`, `remark-gfm`; `tooling` internal += `e2e` (the Playwright config reads the e2e port).
- File types: `tooling` += `apps/*/vite.config.ts`; `WEB_CONCEPTS` += `settings`; `e2e` covers `e2e/**/*.ts` with `.spec` and `.constants` suffixes and the `child_process`, `fs/promises`, `os` and `path` builtins (the spec starts a runner and makes a scratch project).
- Generated files: `apiTypes` and `webRouteTree` are marked `generated: { reason }`.
- `defaults.naming.suffixes` += `.state`; the `test` and `e2e` file types turn `no-captured-mutation` and `no-array-mutation` off (test fakes record calls; Playwright's `fill`); `cli` and `egressGateway` builtins += `stream/consumers`.

## Observations for the rules

- **`no-misused-promises` on JSX props** forced a `startAction` wrapper that only hid a `void`. Resolved in architecture-rules: JSX props are no longer checked for this; conditions, spreads and other callbacks still are.
- **`id-denylist` on `data`** fires wherever an external API names a field `data`. The three suppressions are at the single point that touches each external shape.
- **Generated files** used to need a per-rule override for every rule their generator broke, plus a replaced header because `reasoned-suppressions` rejects file-wide disables. Resolved by the `generated` file-type setting.
- **Reassigned `let` is not reported.** `prefer-const` fires only when a binding is never reassigned, and no rule bans `let`. STYLE.md bans it; the code follows STYLE.md, but the checker does not enforce it.
