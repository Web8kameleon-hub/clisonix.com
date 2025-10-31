import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); // Keep this line for context

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const baseConfigs = compat.extends("next/core-web-vitals", "next/typescript");

for (const config of baseConfigs) {
  config.rules = {
    ...config.rules,
    "@typescript-eslint/no-unused-expressions": [
      "warn",
      {
        allowShortCircuit: true,
        allowTernary: true,
        allowTaggedTemplates: true,
      },
    ],
  };
}

const eslintConfig = [
  ...baseConfigs,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
