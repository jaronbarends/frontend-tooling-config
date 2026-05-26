import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import configPrettier from 'eslint-config-prettier';
import pluginUnusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'unused-imports': pluginUnusedImports,
    },
    rules: {
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
    },
  },
  configPrettier, // must be last
];
