import { defineConfig } from 'vite'

// Public base path: "/" by default (Docker, local, custom domain).
// The GitHub Pages workflow sets BASE_PATH (e.g. "/portfolio/").
export default defineConfig({
  base: process.env.BASE_PATH || '/',
})
