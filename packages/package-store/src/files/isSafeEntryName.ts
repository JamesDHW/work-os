import { SAFE_ENTRY_NAME_PATTERN } from "./files.constants.ts";

export const isSafeEntryName = (name: string): boolean => SAFE_ENTRY_NAME_PATTERN.test(name);
