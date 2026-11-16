import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The GitHub Pages sub-path is only needed for production builds.
// In dev, the app is served at http://localhost:5173/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/hostel-complaint-system/' : '/',
}))
