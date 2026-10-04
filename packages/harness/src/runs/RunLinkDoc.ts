import { defineDoc } from "@earendil-works/pi-durable";

export type RunLink = {
  readonly runId: string;
};

export const RunLinkDoc = defineDoc<RunLink>({
  kind: "workos.run",
  version: 1,
  scope: "conversation",
  history: "latest",
  fork: "current",
  initial: () => ({ runId: "" }),
});
