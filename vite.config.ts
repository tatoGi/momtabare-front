import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import tailwind from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/' : '/',
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern'
      }
    },
    postcss: {
      plugins: [tailwind(), autoprefixer()],
    },
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@ts': fileURLToPath(new URL('./src/ts', import.meta.url)),
      'vue': '@vue/runtime-dom'
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  optimizeDeps: {
    include: ['vue', 'vue-router']
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      // Add any API proxies here if needed
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor and app code
          'vendor': ['vue', 'vue-router', 'pinia'],
        }
      }
    }
  }
})