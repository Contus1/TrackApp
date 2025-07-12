// Browser-Test für TrackApp 
console.log('🌐 Browser Compatibility Test');

// Test localStorage
try {
  localStorage.setItem('test', 'value');
  localStorage.removeItem('test');
  console.log('✅ localStorage: Working');
} catch(e) {
  console.log('❌ localStorage: Error -', e.message);
}

// Test Environment Variables (Runtime)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('Environment Variables:');
console.log('  URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('  Key:', supabaseKey ? '✅ Set' : '❌ Missing');

// Test Supabase Connection
if (typeof window !== 'undefined' && window.fetch) {
  console.log('✅ fetch API: Available');
  
  // Test CORS and API connectivity
  if (supabaseUrl) {
    fetch(supabaseUrl + '/rest/v1/', {
      headers: {
        'apikey': supabaseKey,
        'Authorization': 'Bearer ' + supabaseKey
      }
    })
    .then(response => {
      console.log('✅ Supabase API: Connected (Status:', response.status, ')');
    })
    .catch(error => {
      console.log('❌ Supabase API: Error -', error.message);
    });
  }
} else {
  console.log('❌ fetch API: Not available');
}

// Test Service Worker
if ('serviceWorker' in navigator) {
  console.log('✅ Service Worker: Supported');
} else {
  console.log('❌ Service Worker: Not supported');
}

// Test PWA features
if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
  console.log('✅ PWA: Running as installed app');
} else {
  console.log('ℹ️ PWA: Running in browser (normal)');
}

console.log('Test complete - check browser console for results');
