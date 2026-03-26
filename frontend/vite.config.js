import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api/users': {
        target: 'http://user-service:8001',
        changeOrigin: true,
      },
      '/api/workouts': {
        target: 'http://workout-service:8002',
        changeOrigin: true,
      },
      '/api/ai': {
        target: 'http://ai-coach-service:8003',
        changeOrigin: true,
      },
    },
  },
})
