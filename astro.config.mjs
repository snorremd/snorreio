import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import solid from '@astrojs/solid-js';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import image from '@astrojs/image';
import robotsTxt from 'astro-robots-txt';
import rehypeInferDescriptionMeta from 'rehype-infer-description-meta';
import { descriptionRemarkPlugin } from './src/plugins/description-remark-plugin.mjs';
import prefetch from "@astrojs/prefetch";
import analyze from "rollup-plugin-analyzer";
import { visualizer } from "rollup-plugin-visualizer";

// https://astro.build/config
export default defineConfig({
  site: 'https://snorre.io',
  vite: { plugins: [analyze(), visualizer()] },
  integrations: [sitemap({}), robotsTxt({}), tailwind(), solid(), mdx({
    rehypePlugins: [rehypeInferDescriptionMeta, descriptionRemarkPlugin]
  }), image({
    serviceEntryPoint: '@astrojs/image/sharp'
  }), prefetch()],
  markdown: {
    rehypePlugins: [rehypeInferDescriptionMeta, descriptionRemarkPlugin]
  },
});