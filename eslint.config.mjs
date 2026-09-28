import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([
    ".pages-build/**",
    ".pages-preview/**",
    "out/**",
    ".next/**",
    "next-env.d.ts",
    "docs/**",
    "test-results/**",
    "playwright-report/**",
  ]),
]);
