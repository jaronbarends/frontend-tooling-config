# frontend-tooling-config

Shared ESLint configuration for JavaScript, React, and Next.js projects.

## Why this exists

I want to be able to re-use my frontend tooling setup across project. This consists of three parts:

- ESLint config for syntax checking
- .prettierrc for code formatting
- settings.json for VSCode for using ESLint and .prettierrc

### ESLint config

Instead of using `.eslintrc` we're now using ESLint flat config (the default since ESLint 9). Flat config does not extend referenced packages (`extends: ['eslint:recommended', 'plugin:react/recommended'], ...`) like `.eslintrc` does, but you directly import config files that you spread an can override:

```js
import someConfig from "eslint-config-something";
export default [
  ...someConfig, // was: extends: ['something']
  {
    rules: {
      /* your overrides */
    },
  },
];
```

This repo is contains those config files, and other files needed for vscode and prettier.

Prettier is intentionally kept separate. It handles formatting; ESLint handles code quality. They don't overlap because [`eslint-config-prettier`](https://www.npmjs.com/package/eslint-config-prettier) disables any ESLint rules that would conflict with Prettier.

#### How this ESLint config works

The config is split into three layers that build on each other:

```
base.mjs      JS rules, TypeScript parser, unused import detection
  ↓
react.mjs     + React and React Hooks rules
  ↓
next.mjs      + Next.js, accessibility (jsx-a11y), and import rules
```

Each config file imports the config files it extends (react.mjs imports base.mjs, next.mjs imports react.mjs), so you only need to import one config file in your project.

### .prettierrc

Apart from things like trailing commas, tab width etc, .prettierrc also handles sorting of imports with `@trivago/prettier-plugin-sort-imports`. `.prettierrc` is included as a template that needs to be copied to the project root. To make it extendable, we would need to use a `prettier.config.mjs` file in the external project which comes with more brittle code than a simple copy-paste

## Using this in a project

### 0. Prerequisites

Make sure the Prettier VS Code extension (`esbenp.prettier-vscode`) is installed and enabled for the workspace. If it's disabled, `formatOnSave` and `codeActionsOnSave` both silently fail — ESLint won't auto-fix on save even if it's detecting errors correctly.

### 1. Install the package

```bash
npm install -D @jaronbarends/frontend-tooling-config
```

Peer dependencies are installed automatically (npm 7+). If your project already has conflicting versions of any peer dependency, npm will warn you — resolve those manually.

### 2. Verify that you use ESLint v9

Rationale: see under [`ESLint version pinning`](#eslint version pinning)

### 3. Create `eslint.config.mjs` in the project root

**For a Next.js project:**

```js
import next from "@jaronbarends/frontend-tooling-config/next";

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
import react from "@jaronbarends/frontend-tooling-config/react";

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
import base from "@jaronbarends/frontend-tooling-config/base";

const config = [
  ...base,
  {
    // project-specific overrides go here
  },
];

export default config;
```

### 4. Copy .prettierrc and Vscode settings into the project

Copy these from the `templates/` folder in this repo into your project root:

- `templates/.prettierrc` → `/.prettierrc`
- `templates/.vscode/settings.json` → `/.vscode/settings.json`  
  Configures ESLint auto-fix and Prettier format on save for everyone working in the project, regardless of their personal VS Code settings.

## Publishing a new version

### 1. Update the version

Bump the version in `package.json` following [semver](https://semver.org/):

| Change  | Example           | When                                                                |
| ------- | ----------------- | ------------------------------------------------------------------- |
| `patch` | `1.0.0` → `1.0.1` | Bugfix, no config behavior change                                   |
| `minor` | `1.0.0` → `1.1.0` | New config or export added, backwards compatible                    |
| `major` | `1.0.0` → `2.0.0` | Breaking change (rule added/removed that affects existing projects) |

```bash
npm version patch   # or minor, or major
```

This updates `package.json` and creates a git tag automatically.

### 2. Publish

```bash
npm publish --access public
```

### 3. Push including the tag

```bash
git push && git push --tags
```

### Updating consuming projects

After publishing, update the package in any project that uses it:

```bash
npm update @jaronbarends/frontend-tooling-config
```

Note that if you bumped a **major** version, `npm update` won't cross the major boundary. You'll need:

```bash
npm install -D @jaronbarends/frontend-tooling-config@latest
```

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

## TODO

### Add Type-aware lint rules

(checks not only syntax, but also things like return types, like this:

```
// @typescript-eslint/no-floating-promises
async function fetchData() { return await getData(); }

fetchData(); // ← flagged: Promise not awaited or handled
```

)
