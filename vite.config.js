import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Only process node_modules
          if (id.includes('node_modules')) {
            // React ecosystem (react, react-dom, react-router, etc.)
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }

            // MUI ecosystem (@mui, @emotion)
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'mui';
            }

            // TanStack Query (@tanstack)
            if (id.includes('@tanstack')) {
              return 'query';
            }

            // Form libraries (react-hook-form, zod, @hookform)
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
              return 'form';
            }

            // Animation libraries (motion, auto-animate)
            if (id.includes('motion') || id.includes('auto-animate')) {
              return 'motion';
            }

            // Appwrite SDK
            if (id.includes('appwrite')) {
              return 'appwrite';
            }

            // All other node_modules → generic vendor chunk
            return 'vendor';
          }
        },
      }
    },
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2015',
  }
})
