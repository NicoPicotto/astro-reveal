# astro-reveal

Scroll reveal animations for [Astro](https://astro.build) — smooth slide-ins, fades, scales — that work with **any** UI framework or no framework at all.

- **Zero runtime JS by default.** Uses native CSS [scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline). In purist mode your page ships a single stylesheet and nothing else.
- **Opt-in JS engine** (`mode: "observer"`) when you want the classic "reveal once and stay" behaviour and universal browser support — about **0.6 KB** gzipped.
- **UI-agnostic.** Astro outputs HTML in the end, so the same `data-reveal` attribute animates content whether it came from a React, Vue, Svelte island, or plain HTML.
- **FOUC-proof and accessible by design.** No flash of hidden content, and `prefers-reduced-motion` is respected out of the box.
- **Plays nice with View Transitions** and late-hydrating islands.

It's the [AOS](https://github.com/michalsnik/aos) idea, rebuilt for the Astro era.

## Install

```sh
npx astro add astro-reveal
```

Or manually:

```sh
npm install astro-reveal
```

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import reveal from "astro-reveal";

export default defineConfig({
  integrations: [reveal()],
});
```

That's it. The integration injects the stylesheet for you — no manual CSS import needed.

## Usage

Use the component:

```astro
---
import Reveal from "astro-reveal/Reveal.astro";
---
<Reveal animation="up">
  <h1>I rise into place as you scroll.</h1>
</Reveal>

<Reveal animation="scale" distance="3rem" as="section">
  <p>Render as any tag with `as`.</p>
</Reveal>
```

Or the raw attribute (works on anything, including markup from other frameworks):

```html
<div data-reveal="fade">Hello</div>
<img data-reveal="left" src="/photo.jpg" alt="" />
```

### Animations

| Value   | Effect                                  |
| ------- | --------------------------------------- |
| `up`    | rises into place (starts below)         |
| `down`  | drops into place (starts above)         |
| `left`  | slides left (starts to the right)       |
| `right` | slides right (starts to the left)       |
| `fade`  | opacity only                            |
| `scale` | scales up from slightly smaller         |
| `blur`  | un-blurs into focus                     |

## The two engines

You pick the engine; the API stays identical.

| `mode`               | Runtime JS | Behaviour                          | Browser support                             |
| -------------------- | ---------- | ---------------------------------- | ------------------------------------------- |
| `"scroll"` (default) | **none**   | scrubbed — reverses on scroll up   | animates where supported, static elsewhere  |
| `"observer"`         | ~0.6 KB    | plays **once** and stays           | everywhere                                  |
| `"auto"`             | ~0.6 KB    | native where supported, JS fallback | identical everywhere                        |

```js
reveal({ mode: "observer" }); // the "on steroids" mode
```

Why this matters: in `"scroll"` mode the hidden ("from") state only exists inside an `@supports (animation-timeline: view())` block. A browser that can't animate it **never hides the content** — so there is no flash and nothing can get stuck invisible. The trade-off is that scroll-driven animations are *scrubbed*: scroll back up and they play in reverse. If you want "appear once and stay put", switch to `"observer"`.

## Options

```ts
reveal({
  mode: "scroll",                  // "scroll" | "observer" | "auto"
  once: true,                      // observer/auto: reveal once and keep it
  threshold: 0.15,                 // observer/auto: IntersectionObserver threshold
  rootMargin: "0px 0px -10% 0px",  // observer/auto: fire slightly before the fold
});
```

## Customisation

Tune per element with CSS custom properties (via the component or inline style):

```html
<div data-reveal="up" style="--reveal-distance: 4rem; --reveal-duration: 1s;"></div>
```

| Variable             | Default                        | Applies to        |
| -------------------- | ------------------------------ | ----------------- |
| `--reveal-distance`  | `1.5rem`                       | up/down/left/right |
| `--reveal-scale`     | `0.94`                         | scale             |
| `--reveal-blur`      | `8px`                          | blur              |
| `--reveal-duration`  | `700ms`                        | observer mode     |
| `--reveal-easing`    | `cubic-bezier(.16,1,.3,1)`     | observer mode     |
| `--reveal-index`     | `0`                            | stagger position  |
| `--reveal-stagger`   | `90ms`                         | observer mode     |

Set them globally by targeting `[data-reveal]` in your own CSS. Everything ships inside `@layer astro-reveal`, so your styles always win without specificity battles.

### Easing presets

> **Mode note:** `data-easing` / `easing` and `data-speed` / `speed` only take effect in `observer` and `auto` modes. In `scroll` mode (the default, purist engine) the animation timing is driven by scroll position and uses a fixed linear curve by design — these attributes do nothing there and that is not a bug. `data-distance-preset` / `distancePreset` works in both engines.

Pick a named easing curve with `data-easing` or the component prop:

```html
<div data-reveal="up" data-easing="bounce">…</div>
```

```astro
<Reveal animation="up" easing="bounce">…</Reveal>
```

| Value | Curve | Feel |
| --------- | ----------------------------------------- | ------------------------------ |
| `smooth`  | `cubic-bezier(0.16, 1, 0.3, 1)`           | easeOutExpo — **default**      |
| `bounce`  | `cubic-bezier(0.34, 1.56, 0.64, 1)`       | slight overshoot / spring      |
| `elastic` | `cubic-bezier(0.68, -0.55, 0.27, 1.55)`   | pronounced back-and-forth snap |
| `sharp`   | `cubic-bezier(0.4, 0, 0.2, 1)`            | Material Design crisp          |
| `soft`    | `cubic-bezier(0.33, 1, 0.68, 1)`          | easeOutCubic, gentle           |

These are sugar over `--reveal-easing`. Setting the variable directly always wins.

### Speed presets

```html
<div data-reveal="fade" data-speed="fast">…</div>
```

```astro
<Reveal animation="fade" speed="fast">…</Reveal>
```

| Value | `--reveal-duration` |
| --------- | ------------------- |
| `instant` | `200ms` |
| `fast`    | `400ms` |
| `normal`  | `700ms` (= default) |
| `slow`    | `1100ms` |

Sugar over `--reveal-duration`. The `duration` prop / inline var always wins.

### Distance presets

```html
<div data-reveal="left" data-distance-preset="large">…</div>
```

```astro
<Reveal animation="left" distancePreset="large">…</Reveal>
```

| Value    | `--reveal-distance` |
| -------- | ------------------- |
| `small`  | `0.5rem`  |
| `medium` | `1.5rem` (= default) |
| `large`  | `3rem`    |

Sugar over `--reveal-distance`. The `distance` prop / inline var always wins.

### Stagger

```astro
{items.map((item, i) => <Reveal animation="up" index={i}>{item}</Reveal>)}
```

In `observer` mode each item gets `transition-delay: index * --reveal-stagger` for a crisp cascade. In `scroll` mode stagger is approximated by nudging each item's scroll range (grouped staggers are crisper in `observer` mode).

## Accessibility

Users with `prefers-reduced-motion: reduce` see content in its final state immediately, in every mode. This is built into the CSS, not bolted on — there's no configuration to forget.

## Browser support

Native scroll-driven animations (`animation-timeline: view()`) ship in Chromium-based browsers. Firefox and Safari support has been moving — **check [caniuse.com/css-scroll-timeline](https://caniuse.com/?search=animation-timeline) for the current state** before relying on purist mode for a specific audience.

- If you target only modern Chromium → `"scroll"` (zero JS).
- If you need identical behaviour everywhere → `"auto"` (native where it can, JS where it can't).
- If you specifically want "reveal once and stay" → `"observer"`.

## How it works

A tiny head-inline script (only injected in `observer`/`auto` modes) decides which engine runs by toggling a single `reveal-js` class on `<html>` before paint. The two CSS rule sets — one scoped to `html:not(.reveal-js)` (native), one to `html.reveal-js` (JS) — are therefore mutually exclusive by construction. No double-animating, no race conditions.

## License

MIT © Nicolás Picotto
