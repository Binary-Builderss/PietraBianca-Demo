import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: process.env.SITE_URL, // solo in produzione (dominio da decidere): attiva canonical, og:url e gli URL del JSON-LD
  vite: { plugins: [tailwindcss()] },
});
