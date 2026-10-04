export const resolvePath = (cwd: string, path: string): string => {
  if (path.startsWith("/")) return normalizeSlashes(path);

  return normalizeSlashes(`${cwd}/${path}`);
};

export const joinPaths = (parts: readonly string[]): string => normalizeSlashes(parts.join("/"));

const normalizeSlashes = (path: string): string => {
  const segments = path.split("/").filter((segment) => segment.length > 0 && segment !== ".");
  return `/${segments.join("/")}`;
};
