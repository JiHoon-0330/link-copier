import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        content: path.resolve(__dirname, "scripts/content.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
});
