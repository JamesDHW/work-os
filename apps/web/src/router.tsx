import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen.ts";

export const router = createRouter({ routeTree, defaultPreload: "intent" });

declare module "@tanstack/react-router" {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- TanStack Router registers the router type through interface merging.
  interface Register {
    router: typeof router;
  }
}
