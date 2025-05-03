import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Set base to relative path for GitHub Pages
  server: {
    port: 3000,
    strictPort: true // Force the specified port, fail if not available
  },
  build: {
    outDir: 'docs' // Keep docs as outDir to match with gh-pages deploy script
  }
}) 