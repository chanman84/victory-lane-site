import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/victory-lane-site/',  // 👈 THIS IS THE FIX
  plugins: [react()],
})