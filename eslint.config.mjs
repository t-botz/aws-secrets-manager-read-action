// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";


export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
        ignores: ["/dist/*", "/lib/*"],
        // extends: ["plugin:github/recommended", "plugin:@typescript-eslint/recommended"],
        plugins: {
            "@typescript-eslint": typescriptEslint,
        },
        files: ["src/**/*.ts"],
    
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 9,
            sourceType: "module",
    
            parserOptions: {
                project: "./tsconfig.json",
            },
        },
    
        rules: {
            "i18n-text/no-en": "off",
        },
    }
  );
