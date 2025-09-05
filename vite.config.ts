import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    // Expose API keys from the build environment to the client-side code.
    // This allows Vercel environment variables to be used.
    'process.env.API_KEY_1': JSON.stringify(process.env.API_KEY_1),
    'process.env.API_KEY_2': JSON.stringify(process.env.API_KEY_2)
  },
  plugins: [react()],
})
