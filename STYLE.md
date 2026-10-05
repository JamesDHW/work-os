# work-os — Code style for agents

> Read this before writing or changing code in this repository.
> It condenses the custom rules in `architecture-rules` (`RULES.md`) into **one way to write each thing**, plus three constraints of our own: short files, small specific functions, and a deliberately small subset of TypeScript.
> Where this file and `RULES.md` disagree, this file wins for work-os. Where this file is silent, follow `RULES.md`. Module boundaries and allowed imports are in `ARCHITECTURE.md` and `architecture.config.ts`.

The goal is code that any agent or person can read top to bottom without surprises. Optimise for understandability over brevity, cleverness or speed. When two ways would work, use the one in this guide, even if the other is shorter.

---

## 1. Size

| Unit | Limit |
| --- | --- |
| File | One primary concept. Aim for under 100 lines. Warning at 150, error at 200. Split by responsibility, never by cutting at a line number. |
| Function | One job at one level of abstraction. Aim for under 15 lines of body. If a function needs a comment to explain a section, that section is a function. |
| Parameters | At most two positional parameters. More than two: one parameter with a named, readonly object type. |
| Nesting | At most two levels of blocks inside a function body. Use guard clauses and helper functions to flatten. |
| Exports | One primary export per file, named after the file. A file may export the types its export needs. |

A function either **coordinates** named steps or **implements** one step. Never both.

```ts
export const decideApproval = (call: CapabilityCall, grants: readonly Grant[]): ApprovalDecision => {
  if (isReadCapability(call.capability)) return { kind: "allow" };
  if (isIrreversibleCapability(call.capability)) return { kind: "ask", durations: ["once"] };

  const matchingGrant = findMatchingGrant(call, grants);
  if (matchingGrant !== undefined) return { kind: "allow", grantId: matchingGrant.id };

  return { kind: "ask", durations: ["once", "run", "always"] };
};
```

---

## 2. The language subset

### Use

`const` · arrow functions · `type` aliases · literal unions · discriminated unions · `readonly` · `as const` · `satisfies` · `async`/`await` · `Promise.all` · `for...of` · `map` / `filter` / `find` / `some` / `every` · `reduce` for simple folds only · `??` · `?.` on values that really can be missing · `instanceof` (errors only) · template literals · object and array spread · destructuring · `switch` over a discriminant · `class` for the error hierarchy only

### Do not use

| Banned | Use instead |
| --- | --- |
| `let`, `var`, reassignment, `++`, `--`, `delete` | New `const` from a named transformation; a parameter instead of a counter; `AbortSignal` or a `Promise` instead of a flag |
| Changing an array, object, `Map` or `Set` from a function other than the one that created it | Long-lived state in a `*.state.ts` module that exports named operations (`pendingRequests.state.ts`); build values inside one call |
| `function` declarations | Arrow functions |
| `interface` | `type` (exception: module augmentation for a third-party API) |
| `enum`, `namespace` | Literal unions; modules |
| `class` (other than errors), `this`, getters/setters, decorators | Readonly data + functions |
| `any`, `as` (except `as const`), `!` non-null assertion, `@ts-ignore`, `@ts-expect-error` | `unknown` + validation at the boundary (an `api` route, a runner handler or a seam package) |
| `else`, `else if` | Guard clauses with early `return` |
| `switch (true)` / `switch (false)` | Ordered guard clauses |
| Nested or effectful ternaries | `if` with `return`, or a named function |
| `for (;;)`, `for...in`, `while`, `do...while` | `for...of`, `Object.entries`, collection methods |
| `break`, `continue`, labels | `find`, `filter`, `some`, or a helper that returns |
| `forEach` | `map` / `filter` for values, `for...of` for effects |
| `.then`, `.catch`, `.finally` | `async` / `await`, `Promise.all` for concurrency |
| `throw`, `try`, `catch`, `finally` in application code | Return `WorkOsError` subclasses; `tryCatch` at boundaries |
| `||` for defaults | `??` |
| `==`, `!=` | `===`, `!==` |
| Truthiness tests on non-booleans (`if (name)`, `if (items.length)`) | Explicit comparisons (`name.length > 0`, `item !== undefined`) |
| Default exports, `export *`, barrel files, `import { x as y }` | Named exports imported from the defining file |
| Generators, `arguments`, `Symbol` tricks, prototype changes | Ordinary functions and data |
| `utils.ts`, `helpers.ts`, `common.ts`, `types.ts` | A file named after its one concept |

---

## 3. One way to do each thing

| Need | The way |
| --- | --- |
| A function | `const name = (input: Input): Output => { ... }`. Explicit return type on exports; inferred on private helpers. |
| An object shape | `type Name = { readonly field: Type }`. Every property and collection `readonly`, recursively. |
| A closed set of values | Literal union: `type RunStatus = "running" \| "waiting" \| "completed"`. |
| Mutually exclusive states | Discriminated union on one field (`status`, `kind`) with state-specific fields. Never parallel booleans. |
| Behaviour per variant | Exhaustive `switch`; every case returns; `default: return value satisfies never`. |
| A value per variant | `const LABELS = { ... } as const satisfies Readonly<Record<RunStatus, string>>`. |
| A decision | Guard clauses for exceptional cases first, main path last, no `else`. |
| A compound condition | Name it: `const canApprove = isOwner \|\| hasAdminRole;`. Parenthesise mixed `&&`/`\|\|`. Conditions contain no effects (`await`, assignment, construction). |
| A boolean result | Return the expression, not `if (x) return true; return false;`. |
| A failure | Return an instance of a `WorkOsError` subclass. Callers narrow with `instanceof`. No result wrappers. |
| A call that can throw (library, I/O, JSON) | Wrap immediately: `const parsed = tryCatch(() => JSON.parse(text));` (sync) or `await tryCatchAsync(() => readFile(path, "utf8"))` (async). Only seam packages and apps do this. |
| Cleanup after an operation | `const result = await tryCatchAsync(op); const closed = await tryCatchAsync(close);` then return a combined error if both failed. No `finally`. |
| Missing data | `undefined` = not known/not provided; `null` = known to be absent; optional property = caller may omit. Default with `??` at the highest level that understands the consequence. |
| An identifier | Branded type (`type RunId = string & { readonly __brand: "RunId" }`) created only by a validating constructor. |
| Untrusted input | Arrives as `unknown`; a `protocol` schema parses it in an `api` route, a runner handler or a seam package; `core` and `domain` only see validated types. |
| An effect (time, randomness, network, storage, model, process) | Declared as a port type in `core`, implemented in a seam package, injected through a dependency factory in `apps/*`. |
| Iteration | `map`/`filter` to transform, `find`/`some`/`every` to search, `for...of` to sequence effects. |
| Concurrency | `await Promise.all(items.map(processItem))`, only when concurrency is the point. |
| A policy value | `SCREAMING_SNAKE_CASE` constant in a `<Concept>.constants.ts` file next to its owner. |
| Logging | Structured operational logs through an injected logger port. No `console.log` left behind. |

### Dependency factory (the only way operations get effects)

```ts
type StartRunDependencies = {
  readonly loadStandard: (id: StandardId) => Promise<Standard | WorkOsError>;
  readonly saveRun: (spec: RunSpec) => Promise<Run | WorkOsError>;
};

export type StartRun = (input: StartRunInput) => Promise<Run | WorkOsError>;

export const createStartRun = (dependencies: StartRunDependencies): StartRun => {
  return async (input) => {
    const standard = await dependencies.loadStandard(input.standardId);
    if (standard instanceof WorkOsError) return standard;

    return dependencies.saveRun(composeRunSpec({ standard, project: input.project, prompt: input.prompt }));
  };
};
```

### Seam implementation (the only place that touches libraries and throwing APIs)

Seam packages implement ports declared in `core`. The return type is the port (`ReadStandardFile`, declared in `core/src/catalogue/ReadStandardFile.ts`).

```ts
export const createReadStandardFile = (root: WorkspaceRoot): ReadStandardFile => {
  return async (standardId) => {
    const text = await tryCatchAsync(() => readFile(join(root, "standards", standardId, "STANDARD.md"), "utf8"));
    if (text instanceof WorkOsError) return new StandardNotFoundError({ standardId, cause: text });

    return parseStandardFile(text);
  };
};
```

---

## 4. Naming

- **Complete, domain-specific words.** `pendingApprovals`, not `items`, `data`, `list`, `tmp`, `x`. Accepted abbreviations: `id`, `URL`, `HTTP`, `API`.
- **Booleans** start with `is`, `has`, `can` or `should`.
- **Functions** are verbs (`composeRunSpec`, `decideApproval`); **types** are nouns (`RunSpec`, `ApprovalDecision`).
- **Factories** are `create<OperationName>`; **React hooks** are `use<Name>`.
- **Files** are named after their one concept: `PascalCase.ts` for types, classes and components; `camelCase.ts` for functions. Role suffixes only: `.hook.ts`, `.constants.ts`, `.schema.ts`, `.test.ts`.
- **No aliases.** Do not create a variable just to rename another; do not rename imports.

## 5. Module layout

1. Imports (from the defining file, never through an index).
2. Types this file owns (props, models, dependency types).
3. The primary export.
4. Private helpers, in the order they are first called, from high-level to low-level.

Types live in the file of the code that owns them. A type used across files gets its own file named after it. Never collect types in a `.types.ts` file.

## 6. Comments

Write none, unless the code cannot express it: an external constraint, a workaround with a link, or a non-obvious invariant. Never narrate steps or label sections. Never leave commented-out code, `TODO`s without a tracked reason, or speculative code for future use.

---

## 7. React and styling (web app)

| Need | The way |
| --- | --- |
| A component | `export const RunCard: FC<RunCardProps> = ({ run, onOpen }) => { ... }` with a named readonly props type in the same file. Props are always destructured in the parameter list; native attributes are forwarded with a rest element (`({ tone, ...buttonProps })`). |
| Folder | A module folder per component: `RunCard/RunCard.tsx`, `RunCard.css.ts`, and `RunCard.hook.ts` when it has behaviour (+ `RunCard.constants.ts`). Screens live in concept folders (`src/inbox/`, `src/runs/`); primitives in `src/ui/`; chrome in `src/shell/`. No barrels. |
| Behaviour | Exactly one component-specific hook returning a named model object (`RunCardModel`). Purely presentational components call no hooks. |
| Server data | TanStack Router **loaders** in `routes/` return a `LoadResult` (`toReady` / `toFailure`). The route component renders an `ErrorNotice` for a failure and passes the values to the screen as props. Never `fetch` or `useEffect` for data. Live updates come from `shell/useServerEvents.ts` invalidating routes. Routes import through `#web/…`. |
| Mutations | A named handler in the hook calls the client, then `router.invalidate()`. |
| Render states | Guard returns for loading / failure / empty; the success state last. `&&` only for a small optional fragment with a boolean condition. |
| Event handlers | Named in the hook (`handleApproveClick`); JSX passes them, or binds a row's value by calling one with plain values only: `onClick={model.handleRemoveClick(connection.id)}`. Inline arrows stay out. An async handler is passed directly: React ignores the returned promise, and `no-misused-promises` does not check JSX props. |
| Derived values | Calculated in the hook during render; never stored in state. `useEffect` only for an isolated external integration, in one named hook. |
| Styling | vanilla-extract only: a `recipe` (or `style`) in the component's `.css.ts`, referencing `vars` from `ui/theme.css.ts`. Variants are recipe variants, not conditional class names. No inline `style`, no raw colours, sizes or font values outside `@work-os/design-tokens`. |
| Icons | `ui/Icon` with a typed `name` union over `@tabler/icons-react`. |
| Overlays | `ui/Menu`, `ui/Popover`, `ui/Dialog` (Radix). Nothing else imports Radix. |
| Composition | `children` and slots, not behaviour flags. |
| Props | Passed explicitly; spreading only in `ui/` primitives forwarding native attributes. |
| Lists | `key` is a stable domain id, never an index. |
| State updates from previous state | Updater function: `setIsOpen((wasOpen) => !wasOpen)`. |
| Memoisation | None (`useMemo`, `useCallback`, `memo`) unless profiling shows a need. |

---

## 8. Checking as you go

- Run `pnpm typecheck`, `pnpm architecture:check` and `pnpm lint` after finishing each slice (a package or feature folder), not after every edit. Run everything, including tests, at each milestone.
- Fix type errors and structural failures (file types, naming, imports, compiler policy). These cannot be suppressed; restructure the code instead.
- Fix a lint finding when complying improves the code. When complying would make the code worse, suppress that one line with the rule name and the concrete cost:

```ts
// oxlint-disable-next-line architecture/no-loop-jumps -- A focused helper here would split one short search into two files.
```

- Never use file-wide disables, inline rule reconfiguration or reasonless suppressions (the checker rejects them, and unused suppressions are errors).
- If a package averages more than about one suppression per 150 lines, re-read it and remove suppressions that a better structure avoids.
- Recurring conflicts between a rule and a pattern are recorded once in `BUILD-NOTES.md`; rule configuration is not changed to make them go away.

---

## 9. Tests

- Colocated `*.test.ts(x)` beside the file under test; e2e in `e2e/*.spec.ts`.
- Test behaviour through the public export. Operations are tested with plain fake functions for their dependencies; no mocking libraries.
- One behaviour per test, named as a sentence: `it("asks for approval when no grant matches")`.
- Explicit assertions; no snapshot tests.
- Pure `domain` functions get the most tests; seam packages get a few integration tests against the real thing (a temporary SQLite file, a temporary folder).

## 10. Dependencies

- Use only the libraries `ARCHITECTURE.md` lists for that file type. Adding a library needs the user's approval first: explain the need, the options and the trade-offs.
- Before writing a helper, check the language, the platform and installed libraries for an existing operation.
- Exact versions, committed lockfile, 14-day minimum release age (exception: the experimental `@earendil-works/*` packages, D52).
- Never commit secrets, including in examples and tests.

---

## 11. Before you finish a change

- [ ] Every file has one concept, a matching name, and is under 150 lines.
- [ ] Every function does one thing at one level of abstraction; no function body over about 15 lines.
- [ ] Nothing from the "Do not use" table appears.
- [ ] Every failure path returns a `WorkOsError` subclass; every throwing call is wrapped at a boundary.
- [ ] Every external input is validated by a `protocol` schema before use.
- [ ] Every effect is injected; the operation is testable with plain fakes.
- [ ] Imports respect `architecture.config.ts`; only `apps/*` construct seam implementations.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm architecture:check` and `pnpm test` pass.
