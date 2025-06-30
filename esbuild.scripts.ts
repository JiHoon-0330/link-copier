import { resolve } from "node:path";
import { build } from "esbuild";

async function buildScripts(name: string, path: string) {
  await build({
    entryPoints: [path],
    bundle: true,
    minify: true,
    outfile: resolve(__dirname, "dist", `${name}.js`),
  });
  console.log(`${name} compiled`);
}

async function bundle(...arr: [name: string, path: string][]) {
  await Promise.all(arr.map(([name, path]) => buildScripts(name, path)));
}

await bundle(
  ["content", resolve(__dirname, "scripts/content.ts")],
  ["service-worker", resolve(__dirname, "scripts/service-worker.ts")],
);
