import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    allowedHosts: [
      'unflushed-uninterpretively-corey.ngrok-free.dev'
    ]
  }
})
