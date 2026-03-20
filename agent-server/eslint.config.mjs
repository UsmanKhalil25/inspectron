// @ts-check
import eslint from "@eslint/js";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["eslint.config.mjs", "dist", "node_modules", "scripts"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  prettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: "module",
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-misused-promises": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-shadow": "warn",
      "@typescript-eslint/no-use-before-define": ["error", "nofunc"],
      "no-console": "off",
      "no-process-env": "error",
      "class-methods-use-this": "off",
      "max-classes-per-file": "off",
      "max-len": "off",
      "no-await-in-loop": "off",
      "no-bitwise": "off",
      "no-shadow": "off",
      "no-underscore-dangle": "off",
      "no-useless-constructor": "off",
      "no-return-await": "off",
      "consistent-return": "warn",
      "no-else-return": "off",
      "new-cap": ["error", { properties: false, capIsNew: false }],
      "import/no-unresolved": "off",
      "import/prefer-default-export": "off",
    },
  },
);
