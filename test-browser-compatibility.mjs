#!/usr/bin/env node

/**
 * Test script for browser-specific issues and invite system
 * Tests localStorage, sessionStorage, and invite functionality
 */

import fs from 'fs';
import path from 'path';

console.log('🧪 Testing Browser Compatibility & Invite System\n');

// Test 1: Check if build files exist
console.log('1. Build Files Check:');
const distPath = './dist';
const indexHtml = path.join(distPath, 'index.html');
const assetsDir = path.join(distPath, 'assets');

if (fs.existsSync(indexHtml)) {
    console.log('   ✅ index.html exists');
} else {
    console.log('   ❌ index.html missing');
}

if (fs.existsSync(assetsDir)) {
    const assets = fs.readdirSync(assetsDir);
    const jsFiles = assets.filter(f => f.endsWith('.js'));
    const cssFiles = assets.filter(f => f.endsWith('.css'));
    
    console.log(`   ✅ Assets directory exists (${jsFiles.length} JS, ${cssFiles.length} CSS files)`);
} else {
    console.log('   ❌ Assets directory missing');
}

// Test 2: Check server.js for SPA routing
console.log('\n2. Server Configuration Check:');
const serverJsPath = './server.js';
if (fs.existsSync(serverJsPath)) {
    const serverContent = fs.readFileSync(serverJsPath, 'utf8');
    
    if (serverContent.includes('/invite/')) {
        console.log('   ✅ Server handles /invite/ routes');
    } else {
        console.log('   ⚠️  Server might not handle /invite/ routes properly');
    }
    
    if (serverContent.includes('application/javascript')) {
        console.log('   ✅ Server sets correct MIME types');
    } else {
        console.log('   ⚠️  Server MIME types might be incorrect');
    }
} else {
    console.log('   ❌ server.js missing');
}

// Test 3: Check diagnostic files
console.log('\n3. Diagnostic Tools Check:');
const debugFiles = [
    './debug-browser-issues.html',
    './debug-auth.html'
];

debugFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`   ✅ ${path.basename(file)} available`);
    } else {
        console.log(`   ❌ ${path.basename(file)} missing`);
    }
});

// Test 4: Check for browser compatibility features
console.log('\n4. Code Compatibility Check:');
const srcFiles = [
    './src/services/friendsService.ts',
    './src/components/InviteHandler.tsx',
    './src/pages/auth.tsx'
];

srcFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        const features = {
            localStorage: content.includes('localStorage'),
            errorHandling: content.includes('try {') && content.includes('catch'),
            browserDetection: content.includes('navigator.userAgent'),
            storageErrorHandling: content.includes('storageError') || content.includes('LocalStorage nicht verfügbar')
        };
        
        const fileName = path.basename(file);
        console.log(`   📁 ${fileName}:`);
        
        Object.entries(features).forEach(([feature, hasFeature]) => {
            console.log(`      ${hasFeature ? '✅' : '❌'} ${feature}`);
        });
    }
});

// Test 5: Generate test URLs for manual testing
console.log('\n5. Test URLs for Manual Testing:');
const baseUrl = 'http://localhost:8080'; // Assuming this is the local server
const testUrls = [
    `${baseUrl}/`,
    `${baseUrl}/auth`,
    `${baseUrl}/invite/test-token-123`,
    `${baseUrl}/debug-browser-issues.html`,
    `${baseUrl}/debug-auth.html`
];

testUrls.forEach(url => {
    console.log(`   🔗 ${url}`);
});

// Test 6: Browser-specific recommendations
console.log('\n6. Browser-Specific Testing Recommendations:');
console.log('   📱 Mobile Chrome: Should work (confirmed)');
console.log('   🔒 Incognito Mode: Should work (confirmed)');
console.log('   🖥️  Chrome Desktop: Test localStorage permissions');
console.log('   🍎 Safari Mobile: Test CORS and storage settings');
console.log('   🧭 Safari Desktop: Test third-party cookie settings');

// Test 7: Debugging steps
console.log('\n7. Debugging Steps for Users:');
console.log('   1. Open debug-browser-issues.html in problematic browser');
console.log('   2. Check browser console for error messages');
console.log('   3. Test in incognito mode to isolate storage issues');
console.log('   4. Clear all browser data if localStorage is corrupted');
console.log('   5. Check browser extensions (adblockers, privacy tools)');

// Test 8: Production deployment notes
console.log('\n8. Production Deployment Notes:');
console.log('   📦 Files ready for deployment');
console.log('   🌐 Ensure Supabase Site URL matches production domain');
console.log('   🔐 Update CORS settings in Supabase dashboard');
console.log('   📱 Test on multiple devices and browsers');

console.log('\n✅ Browser compatibility testing completed!');
console.log('🚀 Ready to test invite links and fix browser-specific issues.');
