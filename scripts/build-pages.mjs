import { cp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const stage = path.join(root, ".pages-build");
const basePath = process.env.PAGES_BASE_PATH ?? "/fateplas";
if (!/^\/[a-zA-Z0-9_-]+$/.test(basePath) && basePath !== "") {
  throw new Error(
    "PAGES_BASE_PATH must be empty or a single URL path segment.",
  );
}

// Build a separate static copy: never remove API routes from the working application.
await rm(stage, { recursive: true, force: true });
await mkdir(stage);
for (const name of [
  "src",
  "public",
  "package.json",
  "tsconfig.json",
  "next-env.d.ts",
  "next.config.ts",
  "postcss.config.mjs",
]) {
  await cp(path.join(root, name), path.join(stage, name), {
    recursive: true,
    filter: (source) =>
      source !== path.join(root, "src/app/api") && !source.endsWith(".test.ts"),
  });
}
await symlink(
  path.join(root, "node_modules"),
  path.join(stage, "node_modules"),
  "dir",
);
const result = spawnSync(
  process.execPath,
  [path.join(root, "node_modules/next/dist/bin/next"), "build"],
  {
    cwd: stage,
    stdio: "inherit",
    env: {
      ...process.env,
      FATEPLAS_STATIC_EXPORT: "true",
      FATEPLAS_PROJECT_ROOT: root,
      NEXT_PUBLIC_BASE_PATH: basePath,
      NEXT_PUBLIC_CONTACT_MODE: "placeholder",
      CONTACT_EMAIL_PROVIDER: "none",
    },
  },
);
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
await rm(path.join(root, "out"), { recursive: true, force: true });
await cp(path.join(stage, "out"), path.join(root, "out"), { recursive: true });
await writeFile(path.join(root, "out/.nojekyll"), "");
console.log(
  `Static demo ready in out/, base path: ${basePath || "/"}. Contact is a placeholder.`,
);
