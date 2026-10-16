/*
 * astro-reveal — observer runtime ("on steroids" mode)
 * Injected only when mode is "observer" or "auto". Loaded deferred.
 *
 * Reads config from window.__ASTRO_REVEAL__ (set by the head-inline script,
 * which also decides whether the `.reveal-js` marker belongs on <html>).
 *
 * Responsibilities — the four things AOS gets wrong:
 *   1. Never touch anything unless this browser is actually using the JS
 *      engine (the `.reveal-js` marker is present). In "auto" mode a browser
 *      with native scroll-timeline support has no marker, so we no-op.
 *   2. Re-scan after Astro View Transitions (`astro:page-load`).
 *   3. Watch for late-hydrated islands via MutationObserver.
 *   4. Bail entirely under prefers-reduced-motion (CSS already shows content).
 */

interface RevealConfig {
  mode: "scroll" | "observer" | "auto";
  once: boolean;
  threshold: number;
  rootMargin: string;
}

const REVEALED = "is-revealed";

function getConfig(): RevealConfig {
  const w = window as unknown as { __ASTRO_REVEAL__?: RevealConfig };
  return (
    w.__ASTRO_REVEAL__ ?? {
      mode: "observer",
      once: true,
      threshold: 0.15,
      rootMargin: "0px 0px -10% 0px",
    }
  );
}

function shouldRun(): boolean {
  // Only the JS engine touches the DOM. If the marker isn't there
  // (purist / auto-on-supporting-browser), the CSS engine owns this page.
  if (!useJS()) return false;
  // Respect the user. The hidden state is gated by no-preference in CSS,
  // so content is already visible — nothing for us to do.
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
    return false;
  return true;
}

let observer: IntersectionObserver | null = null;
let mutationObserver: MutationObserver | null = null;

function reveal(el: Element) {
  el.classList.add(REVEALED);
}

function observe(el: Element, config: RevealConfig) {
  if (el.classList.contains(REVEALED)) return;
  observer!.observe(el);
}

function collect(root: ParentNode = document): Element[] {
  return Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
}

function setup() {
  if (!shouldRun()) return;

  const config = getConfig();

  observer?.disconnect();
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          if (!config.once) entry.target.classList.remove(REVEALED);
          continue;
        }
        reveal(entry.target);
        if (config.once) observer!.unobserve(entry.target);
      }
    },
    { threshold: config.threshold, rootMargin: config.rootMargin },
  );

  for (const el of collect()) observe(el, config);

  // Watch for elements added after first paint (hydrated islands, CMS
  // fragments swapped in, client:visible components, etc.)
  mutationObserver?.disconnect();
  mutationObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of Array.from(m.addedNodes)) {
        if (!(node instanceof Element)) continue;
        if (node.matches?.("[data-reveal]")) observe(node, config);
        for (const child of collect(node)) observe(child, config);
      }
    }
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });
}

function useJS() {
  return (window as unknown as { __revealJS__?: boolean }).__revealJS__;
}

function init() {
  // Cache this value in the window in case the body is switched out
  (window as unknown as { __revealJS__?: boolean }).__revealJS__ =
    document.documentElement.classList.contains("reveal-js");
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup, { once: true });
  } else {
    setup();
  }
}

init();
// The router swaps <html> attributes, dropping the marker. Restore it before
// the new page paints, so the CSS engine never flashes in between.
document.addEventListener("astro:after-swap", () => {
  if (useJS()) document.documentElement.classList.add("reveal-js");
});
// Astro View Transitions: the DOM is swapped, observers are stale. Re-arm.
document.addEventListener("astro:page-load", () => {
  if (useJS()) setup();
});

export {};
