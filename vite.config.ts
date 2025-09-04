import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    // Expose API_KEY from the build environment to the client-side code.
    // This allows Netlify/Vercel environment variables to be used.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  plugins: [react()],
})
