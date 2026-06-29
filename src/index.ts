import type { AstroIntegration } from "astro";
import { readFileSync } from "node:fs";

// Read our own package name so injected imports keep resolving even if the
// package is renamed/forked. (dist/index.js -> ../package.json = package root.)
const PKG = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf-8")
) as { name: string };

export type RevealMode = "scroll" | "observer" | "auto";

export interface RevealOptions {
  /**
   * Which engine to use.
   *  - "scroll"   (default) Native CSS scroll-driven animations. Zero runtime
   *               JS. Scrubbed: reverses as you scroll back up. Browsers
   *               without support show content normally (no animation, no FOUC).
   *  - "observer" IntersectionObserver. ~1KB JS. Plays once and stays. Works
   *               everywhere. This is the "on steroids" mode.
   *  - "auto"     Native where supported, falls back to observer where not, so
   *               it looks identical across browsers (always ships the ~1KB).
   * @default "scroll"
   */
  mode?: RevealMode;
  /**
   * Observer/auto only. Reveal once and keep it revealed (true), or re-hide
   * when the element leaves the viewport (false).
   * @default true
   */
  once?: boolean;
  /**
   * Observer/auto only. IntersectionObserver threshold.
   * @default 0.15
   */
  threshold?: number;
  /**
   * Observer/auto only. IntersectionObserver rootMargin. The default trims the
   * bottom so reveals fire slightly before the element hits the fold.
   * @default "0px 0px -10% 0px"
   */
  rootMargin?: string;
}

const DEFAULTS: Required<RevealOptions> = {
  mode: "scroll",
  once: true,
  threshold: 0.15,
  rootMargin: "0px 0px -10% 0px",
};

function headInline(opts: Required<RevealOptions>): string {
  const runtime = {
    mode: opts.mode,
    once: opts.once,
    threshold: opts.threshold,
    rootMargin: opts.rootMargin,
  };
  // Runs in <head> before paint. Decides the engine by toggling the marker
  // class, so the CSS rule sets stay mutually exclusive. No marker => purist.
  return `(function(){var o=${JSON.stringify(runtime)};window.__ASTRO_REVEAL__=o;try{var s=window.CSS&&CSS.supports&&CSS.supports("animation-timeline: view()");if(o.mode==="observer"||(o.mode==="auto"&&!s)){document.documentElement.classList.add("reveal-js");}}catch(e){document.documentElement.classList.add("reveal-js");}})();`;
}

export default function astroReveal(options: RevealOptions = {}): AstroIntegration {
  const config: Required<RevealOptions> = { ...DEFAULTS, ...options };

  return {
    name: PKG.name,
    hooks: {
      "astro:config:setup": ({ injectScript, logger }) => {
        // The stylesheet is always needed. Injecting it at the `page-ssr`
        // stage associates it with each page's server render, so Astro emits
        // the <link>/inline <style> reliably — and ships ZERO client JS.
        injectScript("page-ssr", `import ${JSON.stringify(`${PKG.name}/styles.css`)};`);

        if (config.mode !== "scroll") {
          injectScript("head-inline", headInline(config));
          injectScript("page", `import ${JSON.stringify(`${PKG.name}/observer`)};`);
        }

        logger.info(
          `enabled in "${config.mode}" mode` +
            (config.mode === "scroll" ? " (zero runtime JS)" : ` (once: ${config.once})`)
        );
      },
    },
  };
}
