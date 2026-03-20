import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://g1111yn.github.io',
  integrations: [sitemap()],
});
