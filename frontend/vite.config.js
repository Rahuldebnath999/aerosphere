import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cesium from 'vite-plugin-cesium'

export default defineConfig({
  plugins: [
    react(),
    cesium(),   // copies Cesium's Workers/Assets/ThirdParty into dist
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 10000,
    target: 'es2020',
  },
  // Tell Vite not to pre-bundle Cesium (it's already optimised by the plugin)
  optimizeDeps: {
    exclude: ['cesium'],
  },
  define: {
    // Cesium expects these globals
    CESIUM_BASE_URL: JSON.stringify('/'),
  },
})
