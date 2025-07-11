#!/bin/bash
# Custom build script that sets environment variables and builds the app

echo "🔧 Setting up environment variables for Vite build..."

export VITE_SUPABASE_URL="https://zbkshutnsojsrjwzullq.supabase.co"
export VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpia3NodXRuc29qc3Jqd3p1bGxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMDIzMDksImV4cCI6MjA2NzU3ODMwOX0.G3h5PuawfEi3h3CmH6BQx_TQ24yOW28Pleq1ftjXe-M"

echo "Environment variables set:"
echo "VITE_SUPABASE_URL: $VITE_SUPABASE_URL"
echo "VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY:0:20}..."

echo "🏗️ Running npm install..."
npm install

echo "🏗️ Running build with environment variables..."
npm run build

echo "✅ Build completed!"
ls -la dist/
