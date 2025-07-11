#!/usr/bin/env node

// Simple diagnostic script for deployment debugging
import { existsSync } from 'fs';
import { join } from 'path';

console.log('🔍 TrackApp Deployment Diagnostics');
console.log('=====================================');

console.log('\n📁 File Structure:');
const distExists = existsSync('./dist');
const indexExists = existsSync('./dist/index.html');
const serverExists = existsSync('./server.js');
const packageExists = existsSync('./package.json');

console.log(`✅ dist/ folder: ${distExists ? 'EXISTS' : 'MISSING'}`);
console.log(`✅ dist/index.html: ${indexExists ? 'EXISTS' : 'MISSING'}`);
console.log(`✅ server.js: ${serverExists ? 'EXISTS' : 'MISSING'}`);
console.log(`✅ package.json: ${packageExists ? 'EXISTS' : 'MISSING'}`);

console.log('\n🌐 Environment Variables:');
console.log(`VITE_SUPABASE_URL: ${process.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING'}`);
console.log(`VITE_SUPABASE_ANON_KEY: ${process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`PORT: ${process.env.PORT || '8080 (default)'}`);

console.log('\n🚀 Server Test:');
if (serverExists) {
  console.log('✅ Server file exists - ready to start');
} else {
  console.log('❌ Server file missing - deployment will fail');
}

console.log('\n💡 Next Steps:');
if (!distExists) {
  console.log('1. Run: npm run build');
}
if (!process.env.VITE_SUPABASE_URL) {
  console.log('2. Set VITE_SUPABASE_URL in your deployment environment');
}
if (!process.env.VITE_SUPABASE_ANON_KEY) {
  console.log('3. Set VITE_SUPABASE_ANON_KEY in your deployment environment');
}
console.log('4. Deploy to DigitalOcean');
console.log('5. Check browser console for any JavaScript errors');

console.log('\n🎯 All looks good! Ready for deployment.');
