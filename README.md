# frontend-tooling-config

Shared ESLint configuration for JavaScript, React, and Next.js projects.

## Why this exists

ESLint flat config (the default since ESLint 9) doesn't have a built-in way to extend from a config file outside a project. The options are relative path imports (fragile) or a proper package (portable). This repo is that package — it lets all projects reference a single source of truth for linting rules, versioned in git.

Prettier is intentionally kept separate. It handles formatting; ESLint handles code quality. They don't overlap because `eslint-config-prettier` disables any ESLint rules that would conflict with Prettier.

## How it works

The config is split into three layers that build on each other:

```
base.mjs      JS rules, TypeScript parser, unused import detection
  ↓
react.mjs     + React and React Hooks rules
  ↓
next.mjs      + Next.js, accessibility (jsx-a11y), and import rules
```

Each project imports the layer that matches its stack.

## Using this in a project

### 1. Install the package

In your project root, add this to `devDependencies` in `package.json`:

```json
"@jaronbarends/frontend-tooling-config": "file:../../frontend-tooling-config"
```

Adjust the relative path to point to where this repo lives on disk. Then run:

```bash
npm install
```

> If you ever publish this package to npm, replace the `file:` path with a version number like `"^1.0.0"`. Nothing else changes.

### 2. Install ESLint in the project

```bash
npm install -D eslint
```

### 3. Create `eslint.config.mjs` in the project root

**For a Next.js project:**
```js
import next from '@jaronbarends/frontend-tooling-config/next';

const config = [
  ...next,
  {
    // project-specific overrides go here
  },
];

export default config;
```

**For a React project:**
```js
import react from '@jaronbarends/frontend-tooling-config/react';

const config = [
  ...react,
  {
    // project-specific overrides go here
  },
];

export default config;
```

**For a plain JS project:**
```js
import base from '@jaronbarends/frontend-tooling-config/base';

const config = [
  ...base,
  {
    // project-specific overrides go here
  },
];

export default config;
```

### 4. Copy template files into the project

Copy these from the `templates/` folder in this repo into your project root:

- `templates/.vscode/settings.json` → `.vscode/settings.json`  
  Configures ESLint auto-fix and Prettier format on save for everyone working in the project, regardless of their personal VS Code settings.

- `templates/.prettierrc` → `.prettierrc`  
  Prettier formatting rules. Adjust to taste — Prettier config is intentionally per-project, not part of this package.

> Make sure the Prettier VS Code extension (`esbenp.prettier-vscode`) is installed and enabled for the workspace. If it's disabled, `formatOnSave` and `codeActionsOnSave` both silently fail.

## Caveats and pitfalls

### ESLint version pinning

All packages in this repo are pinned to ESLint 9. Do not upgrade `@eslint/js` to v10 — it will conflict with `eslint-plugin-react`, which only supports up to ESLint 9. Check compatibility before upgrading any ESLint-related dependency.

### `eslint-config-next` is not used

`eslint-config-next` (the official Next.js ESLint config) uses an old config format with `@rushstack/eslint-patch`. This is fundamentally incompatible with being loaded from outside a project via flat config. Instead, `next.mjs` directly imports the underlying plugins that `eslint-config-next` wraps:

- `@next/eslint-plugin-next`
- `eslint-plugin-jsx-a11y`
- `eslint-plugin-import`

This means Next.js linting rule updates won't be picked up automatically when Next.js releases a new version. Occasionally check what rules `eslint-config-next` sets and compare against `next.mjs`.

### Global ignores must be a standalone config object

In ESLint flat config, `ignores` only applies globally when it is the sole key in a config object. If you add any other key to that object, it becomes scoped. `next.mjs` has a comment marking this — don't merge the ignores object with anything else.

### TypeScript parser in `base.mjs`

`@typescript-eslint/parser` is used even in `base.mjs` because it's a superset of JavaScript and handles both. This means TS parser is a dependency even in plain JS projects. It causes no issues in practice, but it's a deliberate tradeoff for simplicity.

### `file:` references and `npm install`

When you update this package, projects that reference it via `file:` don't pick up changes automatically. You need to run `npm install` in each project after making changes here. This is standard npm behavior for `file:` dependencies. (`file:` references work differently from registry packages. With a registry package, npm caches by version number and won't re-fetch unless the version changes. With a file: reference, npm copies the files directly from the local path each time you run npm install, regardless of version. So the version number in package.json is irrelevant for `file:` dependencies.)

### Prettier must be installed and enabled

The VS Code Prettier extension must be installed and enabled for the workspace. If it's disabled, `formatOnSave` and `codeActionsOnSave` both silently fail — ESLint won't auto-fix on save even if it's detecting errors correctly.

## What's not included

- **Type-aware lint rules** — rules that use the TypeScript compiler to catch type-level bugs. These are slower and require `tsconfig.json` to be wired up. Can be added later.
- **Import sorting** — handled by `@trivago/prettier-plugin-sort-imports` in `.prettierrc`, not ESLint.