import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import process from "process";
import { createInterface } from "readline/promises";

/** Asks a yes/no question in this terminal; anything but y or yes is no. */
export const confirm = async (question: string): Promise<boolean> => {
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await tryCatchAsync(() => prompt.question(`${question} [y/N] `));
  prompt.close();
  if (answer instanceof WorkOsError) return false;
  return ["y", "yes"].includes(answer.trim().toLowerCase());
};
