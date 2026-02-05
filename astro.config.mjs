import { defineConfig } from 'astro/config';
import tailwindcss from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://heyjoo.github.io',
  base: '/joo-log',
  integrations: [tailwindcss()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
