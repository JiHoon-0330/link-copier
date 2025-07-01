import { $ } from "bun";
import { generateI18nSrc } from "./generate-i18n-src";

const outDir = "./src/__i18n__";
await generateI18nSrc("./__locales__", outDir);
await $`bunx biome format --write ${outDir}`;
