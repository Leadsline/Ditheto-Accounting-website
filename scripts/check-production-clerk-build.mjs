import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const assetRoot = path.resolve(
  scriptDirectory,
  "..",
  "artifacts",
  "ditheto-accountants",
  "dist",
  "public",
);
const textExtensions = new Set([
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".json",
  ".mjs",
  ".map",
  ".txt",
]);
const testKeyPattern = /\bpk_test_[A-Za-z0-9_-]{10,}\b/g;
const liveKeyPattern = /\bpk_live_[A-Za-z0-9_-]{10,}\b/g;
const productionAuthExpected =
  process.env.CLERK_PRODUCTION_AUTH_EXPECTED === "1" ||
  process.env.VERCEL_ENV === "production";

async function findTextAssets(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findTextAssets(entryPath)));
    } else if (textExtensions.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}

if (!productionAuthExpected) {
  console.log(
    "Production Clerk asset check skipped (set CLERK_PRODUCTION_AUTH_EXPECTED=1 for a production-auth build).",
  );
  process.exit(0);
}

const files = await findTextAssets(assetRoot);
const findings = [];
let testKeyCount = 0;
let liveKeyCount = 0;

for (const file of files) {
  const contents = await readFile(file, "utf8");
  const testKeys = contents.match(testKeyPattern) ?? [];
  const liveKeys = contents.match(liveKeyPattern) ?? [];

  if (testKeys.length > 0 || liveKeys.length > 0) {
    findings.push({
      file: path.relative(assetRoot, file),
      testKeys: testKeys.length,
      liveKeys: liveKeys.length,
    });
  }

  testKeyCount += testKeys.length;
  liveKeyCount += liveKeys.length;
}

const remediation =
  "Set the Vercel Production environment variables CLERK_PUBLISHABLE_KEY to a pk_live_ value and CLERK_SECRET_KEY to its matching sk_live_ value; remove any stale VITE_CLERK_PUBLISHABLE_KEY value, then redeploy.";

if (testKeyCount > 0) {
  console.error(
    `Production Clerk asset check failed: found ${testKeyCount} pk_test key value(s) in compiled public assets.`,
  );
  for (const finding of findings.filter((item) => item.testKeys > 0)) {
    console.error(`- ${finding.file}: ${finding.testKeys} test key value(s)`);
  }
  console.error(remediation);
  process.exit(1);
}

if (liveKeyCount === 0) {
  console.error(
    "Production Clerk asset check failed: no pk_live key value was found in compiled public assets.",
  );
  console.error(remediation);
  process.exit(1);
}

console.log(
  `Production Clerk asset check passed: ${liveKeyCount} pk_live key value(s) found and no pk_test key values detected.`,
);