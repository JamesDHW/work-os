import { ok, type FileError, type FileSystem, type Result, type TextLine, type TextLineReader } from "@earendil-works/pi-durable/env";

import { fileCommands } from "./fileCommands.ts";
import { parseFindLine, parseStatLine } from "./parseFileInfo.ts";
import { joinPaths, resolvePath } from "./resolvePath.ts";
import type { FileCommandRunner } from "./runFileCommand.ts";

export type RunnerFileSystemOptions = {
  readonly id: string;
  readonly cwd: string;
  readonly runFileCommand: FileCommandRunner;
};

export const createRunnerFileSystem = (options: RunnerFileSystemOptions): FileSystem => {
  const run = options.runFileCommand;
  const readBase64 = async (path: string): Promise<Result<Buffer, FileError>> => {
    const encoded = await run({ path, command: fileCommands.readBase64(path) });
    return encoded.ok ? ok(Buffer.from(encoded.value.trim(), "base64")) : encoded;
  };
  const readText = async (path: string): Promise<Result<string, FileError>> => {
    const bytes = await readBase64(path);
    return bytes.ok ? ok(bytes.value.toString("utf8")) : bytes;
  };
  const writeContent = async (path: string, content: string | Uint8Array, command: string): Promise<Result<void, FileError>> => {
    const written = await run({ path, command, stdin: Buffer.from(content).toString("base64") });
    return written.ok ? ok(undefined) : written;
  };
  const runVoid = async (path: string, command: string): Promise<Result<void, FileError>> => {
    const completed = await run({ path, command });
    return completed.ok ? ok(undefined) : completed;
  };
  const runTrimmed = async (path: string, command: string): Promise<Result<string, FileError>> => {
    const completed = await run({ path, command });
    return completed.ok ? ok(completed.value.trim()) : completed;
  };

  return {
    id: options.id,
    cwd: options.cwd,
    absolutePath: async (path) => ok(resolvePath(options.cwd, path)),
    joinPath: async (parts) => ok(joinPaths(parts)),
    readTextFile: async (path) => readText(path),
    openTextLineReader: async (path) => {
      const text = await readText(path);
      return text.ok ? ok(createLineReader(text.value)) : text;
    },
    readTextLines: async (path, lineOptions) => {
      const text = await readText(path);
      return text.ok ? ok(text.value.split("\n").slice(0, lineOptions?.maxLines)) : text;
    },
    readBinaryFile: async (path) => {
      const bytes = await readBase64(path);
      return bytes.ok ? ok<Uint8Array, FileError>(bytes.value) : bytes;
    },
    writeFile: async (path, content) => writeContent(path, content, fileCommands.writeBase64(path)),
    appendFile: async (path, content) => writeContent(path, content, fileCommands.appendBase64(path)),
    truncateFile: async (path, size) => runVoid(path, fileCommands.truncate(path, size)),
    flushFile: async () => ok(undefined),
    renameFile: async (source, destination) => runVoid(source, fileCommands.rename(source, destination)),
    fileInfo: async (path) => {
      const line = await run({ path, command: fileCommands.info(path) });
      return line.ok ? ok(parseStatLine(path, line.value)) : line;
    },
    listDir: async (path) => {
      const listing = await run({ path, command: fileCommands.list(path) });
      if (!listing.ok) return listing;

      const lines = listing.value.split("\n").filter((line) => line.length > 0);
      return ok(lines.map((line) => parseFindLine(path, line)));
    },
    canonicalPath: async (path) => runTrimmed(path, fileCommands.canonical(path)),
    exists: async (path) => {
      const answer = await runTrimmed(path, fileCommands.exists(path));
      return answer.ok ? ok(answer.value === "true") : answer;
    },
    createDir: async (path, dirOptions) => runVoid(path, fileCommands.createDirectory(path, dirOptions?.recursive === true)),
    remove: async (path, removeOptions) => runVoid(path, fileCommands.remove(path, removeFlags(removeOptions))),
    createTempDir: async (prefix) => runTrimmed("(temporary)", fileCommands.createTempDirectory(prefix ?? "work-os.")),
    createTempFile: async (fileOptions) => runTrimmed("(temporary)", fileCommands.createTempFile(fileOptions?.prefix ?? "work-os.", fileOptions?.suffix ?? "")),
    cleanup: async () => undefined,
  };
};

type RemoveOptions = { readonly recursive?: boolean; readonly force?: boolean } | undefined;

const removeFlags = (removeOptions: RemoveOptions): string => {
  const recursiveFlag = removeOptions?.recursive === true ? "-r " : "";
  const forceFlag = removeOptions?.force === true ? "-f " : "";
  return `${recursiveFlag}${forceFlag}`;
};

const createLineReader = (text: string): TextLineReader => {
  const remainingLines = text.split("\n").map((line, index, lines) => ({ text: line, terminated: index < lines.length - 1 }));
  const unread = remainingLines.at(-1)?.text === "" ? remainingLines.slice(0, -1) : remainingLines;
  const lines = unread.values();
  return {
    readLine: async () => ok<TextLine | undefined, FileError>(lines.next().value),
    close: async () => undefined,
  };
};
