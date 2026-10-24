import type { SignInCode, SignInCodes } from "@work-os/core/identity/SignInCodes";
import { SignInCodeSchema } from "@work-os/protocol/common/signInCode.schema";
import { parseWithSchema } from "@work-os/protocol/common/parseWithSchema";
import { tryCatch, tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { readFile, rm } from "fs/promises";

// The CLI writes the code to a file only this user can read, inside the server's data folder; the server removes it once used.
export const createSignInCodes = (path: string): SignInCodes => ({
  readSignInCode: async (): Promise<SignInCode | null | WorkOsError> => {
    const text = await tryCatchAsync(() => readFile(path, "utf8"));
    if (text instanceof WorkOsError) return null;

    const json = tryCatch((): unknown => JSON.parse(text));
    return parseWithSchema(SignInCodeSchema, json, "sign-in code");
  },
  consumeSignInCode: async (): Promise<WorkOsError | undefined> => {
    const removed = await tryCatchAsync(() => rm(path, { force: true }));
    return removed instanceof WorkOsError ? removed : undefined;
  },
});
