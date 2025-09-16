import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      "/mrcem": {
        target: "https://mrcem.codovio.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/mrcem/, ""),
      },
      "/whatsbiz": {
        target: "https://whatsbiz.codovio.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/whatsbiz/, ""),
      },
    },
  },
})
