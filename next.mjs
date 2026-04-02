import pluginNext from '@next/eslint-plugin-next';
import pluginImport from 'eslint-plugin-import';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import react from './react.mjs';

export default [
  // Global ignore for Next.js build output.
  // IMPORTANT: This object must only contain `ignores` — no other keys.
  // ESLint only treats `ignores` as global when it's the sole key in a config object.
  // Adding any other key (plugins, rules, etc.) here will scope it instead of making it global.
  { ignores: ['.next/**'] },
  ...react,
  {
    plugins: {
      '@next/next': pluginNext,
      'import': pluginImport,
      'jsx-a11y': pluginJsxA11y,
    },
    rules: {
      // Next.js
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules,

      // Import
      'import/no-anonymous-default-export': 'warn',

      // Accessibility
      ...pluginJsxA11y.configs.recommended.rules,
      'jsx-a11y/alt-text': ['warn', {
        elements: ['img'],
        img: ['Image'], // treat Next.js <Image> like <img>
      }],
    },
  },
];