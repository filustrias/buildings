import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import rehypeExternalLinks from 'rehype-external-links';
import remarkLiteralTilde from './src/plugins/remark-literal-tilde.mjs';
import rehypeStructure from './src/plugins/rehype-structure.mjs';

export default defineConfig({
  site: 'https://filustrias.github.io',
  base: '/buildings',
  markdown: {
    processor: unified({
      remarkPlugins: [remarkLiteralTilde],
      rehypePlugins: [
        rehypeStructure,
        [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
      ],
    }),
  },
});
