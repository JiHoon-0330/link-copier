import path from "node:path";
import { build } from "esbuild";

await build({
  entryPoints: {
    content: "./scripts/content.ts",
    "service-worker": "./scripts/service-worker.ts",
  },
  bundle: true,
  minify: true,
  outdir: "./dist",
  alias: {
    "@": path.resolve(__dirname, "."),
  },
});
