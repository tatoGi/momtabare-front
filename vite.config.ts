import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwind from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode (development/production)
  const env = loadEnv(mode, process.cwd(), '');
  
  // Determine if we're in development mode
  const isDevelopment = mode === 'development';
  
  // Configure proxy for development
  const proxyConfig = isDevelopment ? {
    // Proxy API calls to avoid CORS issues in development
    '^/api': {
      target: env.VITE_BACKEND_URL || 'https://admin.momtabare.com',
      changeOrigin: true,
      secure: false,
      ws: true,
      rewrite: (path: string) => path.replace(/^\/api/, ''),
      configure: (proxy: any) => {
        proxy.on('error', (err: Error) => {
          console.error('Proxy error:', err);
        });
        proxy.on('proxyReq', (proxyReq: any, req: any) => {
          console.log('Proxying request:', req.method, req.url, '->', proxyReq.path);
        });
        proxy.on('proxyRes', (proxyRes: any, req: any) => {
          console.log('Received Response from Target:', proxyRes.statusCode, req.url);
        });
      }
    }
  } : undefined;
  
  return {
    base: '/',
    css: {
      devSourcemap: true,
      postcss: {
        plugins: [
          tailwind(),
          autoprefixer()
        ]
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/assets/scss/variables";`
        }
      },
      modules: {
        generateScopedName: isDevelopment 
          ? '[name]__[local]__[hash:base64:5]' 
          : '[hash:base64:5]'
      }
    },
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
        '@views': fileURLToPath(new URL('./src/views', import.meta.url)),
        '@stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
        '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
        '@assets': fileURLToPath(new URL('./src/assets', import.meta.url))
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    optimizeDeps: {
      include: ['vue', 'vue-router', '@vueuse/core']
    },
    server: {
      host: '0.0.0.0', // Listen on all network interfaces
      port: 5173,
      strictPort: true,
      cors: true,
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 5173
      },
      proxy: proxyConfig
    },
    build: {
      cssCodeSplit: true,
      cssTarget: 'es2015',
      rollupOptions: {
        output: {
          // Split vendor and app code
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia'],
            styles: ['@/assets/css/main.css']
          },
          // File naming for production builds
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            if (!assetInfo.name) {
              return 'assets/[ext]/[name]-[hash][ext]';
            }
            const ext = assetInfo.name.split('.').pop() || '';
            return ext.toLowerCase() === 'css' 
              ? 'assets/css/[name]-[hash][extname]' 
              : 'assets/[ext]/[name]-[hash][ext]';
          }
        }
      },
      // Ensure build is optimized for production
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: !isDevelopment,
          drop_debugger: !isDevelopment
        }
      },
      // Enable source maps in development
      sourcemap: isDevelopment ? 'inline' : false,
      // Ensure CSS is properly extracted in production
      manifest: true,
      // Enable brotli compression for better performance
      brotliSize: true,
      chunkSizeWarningLimit: 1000
    }
  };
});