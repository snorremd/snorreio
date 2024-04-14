import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import solid from "@astrojs/solid-js";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import robotsTxt from "astro-robots-txt";
import rehypeInferDescriptionMeta from "rehype-infer-description-meta";
import { descriptionRemarkPlugin } from "./src/plugins/description-remark-plugin.mjs";
import prefetch from "@astrojs/prefetch";
import analyze from "rollup-plugin-analyzer";
import { visualizer } from "rollup-plugin-visualizer";
import devtools from "solid-devtools/vite";
import icon from "astro-icon";
import { satoriPlugin } from "./src/plugins/satori-plugin";
  

// https://astro.build/config
export default defineConfig({
  site: "https://snorre.io",
  vite: {
    plugins: [analyze(), visualizer(), devtools({
      /* features options - all disabled by default */
      autoname: true // e.g. enable autoname
    })],
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"]
    }
  },
  integrations: [icon({
    include: {
      // Include only three `mdi` icons in the bundle
      mdi: ["twitter", "github", "link-variant", "download"],
      "material-symbols": ["download", "copyright-outline"],
      "fa": ["soundcloud"]
    }
  }), satoriPlugin(), sitemap({}), robotsTxt({}), tailwind(), solid(), mdx({
    rehypePlugins: [rehypeInferDescriptionMeta, descriptionRemarkPlugin]
  }), prefetch()],
  markdown: {
    rehypePlugins: [rehypeInferDescriptionMeta, descriptionRemarkPlugin]
  }
});