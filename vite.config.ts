
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/PDFWORD/',
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  optimizeDeps: {
    exclude: ['pdfjs-dist']
  }
})
