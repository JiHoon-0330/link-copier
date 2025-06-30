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

await Promise.all([
  buildScripts("content", resolve(__dirname, "scripts/content.ts")),
  buildScripts(
    "service-worker",
    resolve(__dirname, "scripts/service-worker.ts"),
  ),
]);
