import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: "/Personal-dashboard/",
  plugins: [react(), tailwindcss()],
  // Set base path for GitHub Pages
  base: process.env.NODE_ENV === 'production' 
    ? '/Personal-dashboard/'  // Replace with your actual repository name
    : '/',
    
  // Environment variable configuration
  define: {
    // Make sure environment variables are available
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
