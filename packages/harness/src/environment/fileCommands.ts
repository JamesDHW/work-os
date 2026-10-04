import { EXIT_IS_DIRECTORY, EXIT_NOT_DIRECTORY, EXIT_NOT_FOUND } from "../harness.constants.ts";
import { shellQuote } from "./shellQuote.ts";

const requireExisting = (quotedPath: string): string => `{ test -e ${quotedPath} || test -L ${quotedPath}; } || exit ${EXIT_NOT_FOUND};`;
const requireFile = (quotedPath: string): string => `${requireExisting(quotedPath)} test -d ${quotedPath} && exit ${EXIT_IS_DIRECTORY};`;
const ensureParent = (quotedPath: string): string => `mkdir -p -- "$(dirname -- ${quotedPath})" &&`;

export const fileCommands = {
  readBase64: (path: string): string => `${requireFile(shellQuote(path))} base64 -w0 -- ${shellQuote(path)}`,
  writeBase64: (path: string): string => `${ensureParent(shellQuote(path))} base64 -d > ${shellQuote(path)}`,
  appendBase64: (path: string): string => `${ensureParent(shellQuote(path))} base64 -d >> ${shellQuote(path)}`,
  truncate: (path: string, size: number): string => `truncate -s ${Math.max(0, Math.trunc(size))} -- ${shellQuote(path)}`,
  rename: (source: string, destination: string): string =>
    `${ensureParent(shellQuote(destination))} mv -- ${shellQuote(source)} ${shellQuote(destination)}`,
  info: (path: string): string => `${requireExisting(shellQuote(path))} stat -c '%F|%s|%Y' -- ${shellQuote(path)}`,
  list: (path: string): string =>
    `test -d ${shellQuote(path)} || exit ${EXIT_NOT_DIRECTORY}; find ${shellQuote(path)} -mindepth 1 -maxdepth 1 -printf '%y|%s|%T@|%f\\n'`,
  canonical: (path: string): string => `${requireExisting(shellQuote(path))} realpath -- ${shellQuote(path)}`,
  exists: (path: string): string => `if test -e ${shellQuote(path)}; then echo true; else echo false; fi`,
  createDirectory: (path: string, isRecursive: boolean): string => `mkdir ${isRecursive ? "-p " : ""}-- ${shellQuote(path)}`,
  remove: (path: string, flags: string): string => `rm ${flags}-- ${shellQuote(path)}`,
  createTempDirectory: (prefix: string): string => `mktemp -d -t ${shellQuote(`${prefix}XXXXXX`)}`,
  createTempFile: (prefix: string, suffix: string): string => `mktemp --suffix=${shellQuote(suffix)} -t ${shellQuote(`${prefix}XXXXXX`)}`,
} as const;
