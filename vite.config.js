import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    host: true,
    cors: true,
    allowedHosts: ['714b04015413.ngrok-free.app', 'freehand.arlint.dev'],
  },
})
