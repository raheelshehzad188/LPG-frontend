import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // Taake hamesha 5173 par hi chale
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/api_new_ai': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/property': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      }
    }
  }
})