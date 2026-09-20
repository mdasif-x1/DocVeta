/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('pdf-lib')) return 'pdf-lib';
          if (id.includes('pdfjs-dist')) return 'pdfjs';
          if (id.includes('jszip')) return 'jszip';
        },
      },
    },
  },
})

