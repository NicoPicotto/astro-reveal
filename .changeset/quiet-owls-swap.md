---
"astro-reveal": patch
---

Restore the `reveal-js` marker on `astro:after-swap` so it is applied before the new page paints, avoiding a brief flash between engines during View Transitions
