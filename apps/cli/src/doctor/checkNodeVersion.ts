import { MINIMUM_NODE_MAJOR } from "../cli.constants.ts";
import type { DoctorCheck } from "./DoctorCheck.ts";

export const checkNodeVersion = (version: string): DoctorCheck => {
  const major = Number(version.split(".")[0]);
  if (major >= MINIMUM_NODE_MAJOR) return { name: "Node.js", status: "ok", detail: version };

  return { name: "Node.js", status: "fail", detail: `${version}; work-os needs Node.js ${MINIMUM_NODE_MAJOR} or later to run TypeScript directly.` };
};
