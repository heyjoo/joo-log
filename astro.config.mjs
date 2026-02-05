import { defineConfig } from 'astro/config';
import tailwindcss from '@astrojs/tailwind';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  site: 'https://heyjoo.github.io',
  base: isProd ? '/joo-log' : '/',
  integrations: [tailwindcss()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
