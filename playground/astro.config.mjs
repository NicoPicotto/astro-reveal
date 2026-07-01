import { defineConfig } from "astro/config";
import reveal from "astro-reveal";

export default defineConfig({
   integrations: [reveal()], // default = purist / scroll mode
});
