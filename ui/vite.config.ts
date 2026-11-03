import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

function stripCrossorigin(): Plugin {
  return {
    name: 'strip-crossorigin',
    transformIndexHtml(html) {
      return html.replaceAll(' crossorigin', '')
    },
  }
}

export default defineConfig({
  plugins: [react(), stripCrossorigin()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsInlineLimit: 0,
    modulePreload: false,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})
