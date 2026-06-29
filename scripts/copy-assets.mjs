// Copies non-TS assets into dist so resolved paths (./styles/reveal.css) work.
import { cp, mkdir } from "node:fs/promises";
await mkdir("dist/styles", { recursive: true });
await cp("src/styles/reveal.css", "dist/styles/reveal.css");
console.log("[astro-reveal] copied styles to dist/styles/reveal.css");
