// Browser-compatible test for Supabase auth
import { createClient } from '@supabase/supabase-js';

const SUPABASE_CONFIG = {
  url: 'https://zbkshutnsojsrjwzullq.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpia3NodXRuc29qc3Jqd3p1bGxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMDIzMDksImV4cCI6MjA2NzU3ODMwOX0.G3h5PuawfEi3h3CmH6BQx_TQ24yOW28Pleq1ftjXe-M'
};

async function testBrowserAuth() {
  console.log('🔍 Testing Supabase auth in browser context...');
  
  try {
    const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    });
    
    console.log('✅ Supabase client created successfully');
    
    // Test the exact same auth call that's failing
    console.log('🔐 Testing signInWithPassword...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    if (error) {
      console.log('📝 Auth call result:', error.message);
      if (error.message.includes('Invalid login credentials')) {
        console.log('✅ Auth endpoint is working (invalid credentials is expected)');
      } else if (error.message.includes('fetch')) {
        console.log('❌ Network/fetch error detected:', error.message);
      } else {
        console.log('ℹ️ Other auth error:', error.message);
      }
    } else {
      console.log('✅ Unexpected success with test credentials');
    }
    
  } catch (error) {
    console.error('💥 Fatal error in browser auth test:', error);
  }
}

// Run the test
if (typeof window !== 'undefined') {
  testBrowserAuth();
} else {
  console.log('This test is designed for browser environment');
}

export { testBrowserAuth };
