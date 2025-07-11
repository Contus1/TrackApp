import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  },
  define: {
    // Fallback environment variables if not provided by build system
    'import.meta.env.VITE_SUPABASE_URL': process.env.VITE_SUPABASE_URL 
      ? `"${process.env.VITE_SUPABASE_URL}"` 
      : '"https://zbkshutnsojsrjwzullq.supabase.co"',
    'import.meta.env.VITE_SUPABASE_ANON_KEY': process.env.VITE_SUPABASE_ANON_KEY 
      ? `"${process.env.VITE_SUPABASE_ANON_KEY}"` 
      : '"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpia3NodXRuc29qc3Jqd3p1bGxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMDIzMDksImV4cCI6MjA2NzU3ODMwOX0.G3h5PuawfEi3h3CmH6BQx_TQ24yOW28Pleq1ftjXe-M"'
  }
})
