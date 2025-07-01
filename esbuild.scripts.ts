import { resolve } from "node:path";
import { build } from "esbuild";

async function buildScripts(path: string) {
  const filePath = resolve(__dirname, path);
  await build({
    entryPoints: [filePath],
    bundle: true,
    minify: true,
    outdir: "./dist",
  });
  console.log(`${path} compiled`);
}

async function bundle(...pathList: string[]) {
  await Promise.all(pathList.map((path) => buildScripts(path)));
}

await bundle("scripts/content.ts", "scripts/service-worker.ts");
