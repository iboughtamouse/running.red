import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // Enforce `interface` for object shapes, `type` for unions/intersections
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      // Catch stray console.log — allow warn/error for intentional logging
      "no-console": ["warn", { allow: ["warn", "error"] }],
      // Ban deep relative imports — use @/ alias instead
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../../*"],
              message: "Use @/ path alias instead of deep relative imports.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
