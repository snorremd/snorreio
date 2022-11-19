import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import image from '@astrojs/image';
import rehypeInferDescriptionMeta from 'rehype-infer-description-meta';
import { descriptionRemarkPlugin } from './src/plugins/description-remark-plugin.mjs';


// https://astro.build/config
export default defineConfig({
  site: 'https://snorre.io',
  integrations: [
    sitemap({}),
    tailwind(),
    mdx({
    rehypePlugins: [rehypeInferDescriptionMeta, descriptionRemarkPlugin]
  }), image({
    serviceEntryPoint: '@astrojs/image/sharp'
  })],
  markdown: {
    rehypePlugins: [rehypeInferDescriptionMeta, descriptionRemarkPlugin]
  }
});