import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import solid from "@astrojs/solid-js";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import robotsTxt from "astro-robots-txt";
import devtools from "solid-devtools/vite";
import icon from "astro-icon";
import { satoriPlugin } from "./src/plugins/satori-plugin";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://snorre.io",
  vite: {
    plugins: [
      devtools({
        /* features options - all disabled by default */
        autoname: true, // e.g. enable autoname
      }),
    ],
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  integrations: [
    mdx(),
    icon({
      include: {
        mdi: ["link-variant", "download"],
        "material-symbols": [
          "menu",
          "close",
          "dark-mode",
          "light-mode",
          "copyright-outline",
          "download",
          "rss-feed",
        ],
        "fa6-brands": ["soundcloud", "github", "bluesky"],
        "fa6-solid": ["square-rss"],
      },
    }),
    satoriPlugin(),
    sitemap({}),
    robotsTxt({}),
    tailwind(),
    solid(),
  ],
  prefetch: true,
  output: "static",
  adapter: cloudflare({
    imageService: "compile", // Use sharp for static routes
    platformProxy: {
      enabled: true,
      persist: true,
    },
  }),
});
