import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { $ } from "bun";
import glob from "fast-glob";
import { normalizePath } from "./util";

export async function generateI18nSrc(
  /**
   * _locales 폴더 위치
   */
  entryDir: string,

  outDir: string,
) {
  const normalizedEntryDir = normalizePath(entryDir);
  const normalizedOutDir = normalizePath(outDir);
  const paths = await getJSONPaths(normalizedEntryDir);
  const jsonList = getJSONList(paths);
  await $`rm -rf ${normalizedOutDir}`;
  mkdirSync(normalizedOutDir, { recursive: true });
  generateI18nTranslate(jsonList, normalizedOutDir, "i18n.ts");
}

function generateI18nTranslate(
  json: Record<string, Record<string, unknown>>[],
  outDir: string,
  fileName: string,
) {
  const mergedMessages = json
    .map<{ locale: string; localeObject: Record<string, unknown> }>((item) => {
      const [locale, localeObject] = Object.entries(item)[0];
      return { locale, localeObject };
    })
    .reduce(
      (acc, item) => {
        const { locale, localeObject } = item;
        const entries = Object.entries(localeObject);

        for (const [messageName, messageObject] of entries) {
          if (messageName.startsWith("manifest")) {
            continue;
          }
          acc[messageName] ??= {};
          acc[messageName][locale] = messageObject;
        }

        return acc;
      },
      {} as Record<string, Record<string, unknown>>,
    );

  const functionOverloadList = Object.entries(mergedMessages).flatMap(
    ([messageName, localeObject]) => {
      return functionOverload(messageName, localeObject);
    },
  );

  const content = [
    ...functionOverloadList,
    "export function t(messageName: string, ...args: string[]) {",
    "return chrome.i18n.getMessage(messageName, args);",
    "}",
  ];
  writeFileSync(`${outDir}${fileName}`, content.join("\n"));

  function functionOverload(
    messageName: string,
    example: Record<string, unknown>,
  ) {
    return [
      "/**",
      "* @example",
      JSON.stringify(example, null, 2)
        .split("\n")
        .map((line) => `* ${line}`)
        .join("\n"),
      "*/",
      `export function t(messageName: "${messageName}", ...args: string[]): string;`,
    ];
  }
}

async function getJSONPaths(entryDir: string) {
  return await glob(`${entryDir}/**/*.json`);
}

function getJSONList(paths: string[]) {
  const jsonList = paths.map((path) => {
    const locale = path.split("/").at(-2);
    if (!locale?.trim()) throw new Error("locale is not found");
    return { [locale]: JSON.parse(readFileSync(path, "utf-8")) };
  });

  return jsonList;
}
