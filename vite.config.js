import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: "/Personal-dashboard/",
  plugins: [
    react(),
    tailwindcss()
  ],
  
  // Fix import resolution issues
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@contexts': '/src/contexts',
      '@services': '/src/services'
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  },

  // ESBuild configuration to handle JSX in .js files
  esbuild: {
    loader: 'jsx',
    include: [
      'src/**/*.jsx',
      'src/**/*.js'
    ]
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom'],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.jsx': 'jsx'
      }
    }
  },

  // Environment variable configuration
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    // Fix build issues
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lucide-react']
        }
      }
    }
  },

  // Server configuration
  server: {
    port: 3000,
    host: true
  }
})
