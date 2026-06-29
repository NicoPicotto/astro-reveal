# Contributing to astro-reveal

Thanks for helping out! This is a small, focused library — the goal is to stay tiny and predictable.

## Setup

```sh
npm install
npm run build
```

## Develop & test

There's no unit-test suite; the **playground is the test**. After any change to `src/`:

```sh
npm run build
cd playground && npm install && npm run build
grep -oE '<(script|style|link)[^>]*>' dist/index.html
```

Default (purist) mode must ship a `<style>` and **zero** `<script>`. Switch `astro.config.mjs` to `reveal({ mode: "observer" })` to verify the JS engine.

## Ground rules

These keep the library honest — please don't regress them (see `CLAUDE.md` for the full list):

- Purist mode ships **zero** runtime JS.
- Hidden states stay inside `@supports (animation-timeline: view())` and `@media (prefers-reduced-motion: no-preference)`.
- All styles live in `@layer astro-reveal`.

## Pull requests

- Keep PRs focused.
- Run `npm run typecheck` and the smoke test before pushing.
- Add a changeset: `npx changeset` (pick the bump, write one line). PRs without a changeset won't trigger a release.

## License

By contributing you agree your contributions are licensed under the MIT license.
