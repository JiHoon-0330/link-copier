import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { type Message, messages } from "./messages";
import { normalizePath } from "./util";

export function generateI18nLocales(outDir: string = "./__locales__/") {
  const normalizedOutDir = normalizePath(outDir);
  const json: Record<string, Record<string, Message>> = {};

  for (const [name, localeObject] of Object.entries(messages)) {
    for (const [locale, message] of Object.entries(localeObject)) {
      json[locale] = {
        ...(json[locale] ?? {}),
        [name]: message,
      };
    }
  }

  for (const [locale, message] of Object.entries(json)) {
    const folderPath = `${normalizedOutDir}${locale}`;

    if (!existsSync(folderPath)) {
      mkdirSync(folderPath, { recursive: true });
    }

    writeFileSync(
      `${folderPath}/messages.json`,
      JSON.stringify(message, null, 2),
    );
  }
}
