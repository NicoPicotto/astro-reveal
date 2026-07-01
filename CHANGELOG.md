# astro-reveal

## 0.3.0

### Minor Changes

- fcb2762: CSS custom properties (`--reveal-*`) are now inherited from ancestor elements.

  Previously, each `[data-reveal]` element had its own default values for variables like `--reveal-distance`, `--reveal-scale`, and `--reveal-duration`. Because CSS own values beat inherited values, setting these variables on a parent (`section`, `:root`, etc.) had no effect — the element's own defaults always won.

  Defaults are now `var(--x, DEFAULT)` fallbacks at each consumption point instead of own-value declarations on `[data-reveal]`. This means:

  ```css
  /* Now works: all reveals on the page use 2rem travel distance */
  :root {
    --reveal-distance: 2rem;
  }

  /* And a specific section can override */
  .hero {
    --reveal-distance: 4rem;
  }
  ```

  Precedence: inline style > attribute preset (`data-distance-preset`, etc.) > inherited ancestor value > built-in default.

  `--reveal-index` is unchanged — it remains declared per element (`0` by default) since it controls per-element stagger position, not a theme-level value.

  Existing per-element usage (`style="--reveal-distance: 3rem"`, attribute presets, inline props via `<Reveal>`) is unaffected.

## 0.2.0

### Minor Changes

- dd2a1bb: Add named easing presets (`data-easing` / `easing` prop), speed presets (`data-speed` / `speed` prop), and distance presets (`data-distance-preset` / `distancePreset` prop). All are CSS-only sugar over the existing custom properties; the current API is unchanged and inline vars always take precedence.

## 0.1.3

### Patch Changes

- 790d102: minor default range animation adjustment
