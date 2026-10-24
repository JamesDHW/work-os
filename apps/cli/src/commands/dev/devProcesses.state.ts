import type { ChildProcess } from "child_process";

export type DevProcesses = {
  readonly register: (child: ChildProcess) => void;
  readonly stopAll: () => void;
};

// The processes `work-os dev` started, so one Ctrl-C stops them all.
export const createDevProcesses = (): DevProcesses => {
  const children = new Set<ChildProcess>();

  return {
    register: (child) => {
      children.add(child);
      child.once("exit", () => {
        children.delete(child);
      });
    },
    stopAll: () => {
      for (const child of children) {
        child.kill("SIGTERM");
      }
    },
  };
};
