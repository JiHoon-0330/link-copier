import { normalize, sep } from "node:path";

export function normalizePath(path: string) {
  let normalizedPath = normalize(path);

  if (!normalizedPath.endsWith(sep)) {
    normalizedPath += sep;
  }

  return normalizedPath;
}
