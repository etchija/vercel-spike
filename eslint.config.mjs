import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "backend-origin/**",
    ],
  },
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@vercel/kv",
              message: "P1/P2: do not use Vercel storage. Use our repository seam.",
            },
          ],
          patterns: [
            {
              group: ["@vercel/*"],
              message: "P1/P2: no Vercel platform packages in this spike.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
