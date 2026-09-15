import { build } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rm } from "node:fs/promises";

const artifactDir = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(artifactDir, "dist-vercel");
globalThis.require = createRequire(import.meta.url);

await rm(outputDir, { recursive: true, force: true });

await build({
  entryPoints: [path.resolve(artifactDir, "src/app.ts")],
  platform: "node",
  bundle: true,
  format: "esm",
  outdir: outputDir,
  outExtension: { ".js": ".mjs" },
  sourcemap: false,
  plugins: [esbuildPluginPino({ transports: ["pino-pretty"] })],
  external: [
    "*.node",
    "@google-cloud/*",
    "google-auth-library",
    "pg-native",
    "sharp",
    "better-sqlite3",
    "sqlite3",
  ],
  banner: {
    js: `import { createRequire as __bannerCrReq } from "node:module";
globalThis.require = __bannerCrReq(import.meta.url);`,
  },
});