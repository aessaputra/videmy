import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Group React-related libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Group MUI libraries
          'mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          // Group TanStack Query
          'query': ['@tanstack/react-query'],
          // Group Form libraries
          'form': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Group Animation libraries
          'motion': ['motion', '@formkit/auto-animate'],
          // Appwrite SDK
          'appwrite': ['appwrite'],
        },
      }
    },
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2015',
  }
})
