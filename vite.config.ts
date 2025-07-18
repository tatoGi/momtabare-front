import path from 'node:path'
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
      '@': path.resolve(__dirname, './src'),
      '@ts': path.resolve(__dirname, './src/ts'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  server: {
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