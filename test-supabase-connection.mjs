// Quick test script to verify Supabase connectivity
import { createClient } from '@supabase/supabase-js';

const SUPABASE_CONFIG = {
  url: 'https://zbkshutnsojsrjwzullq.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpia3NodXRuc29qc3Jqd3p1bGxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMDIzMDksImV4cCI6MjA2NzU3ODMwOX0.G3h5PuawfEi3h3CmH6BQx_TQ24yOW28Pleq1ftjXe-M'
};

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  console.log('URL:', SUPABASE_CONFIG.url);
  console.log('Key preview:', SUPABASE_CONFIG.anonKey.substring(0, 20) + '...');
  
  try {
    const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    
    // Test basic connection
    console.log('\n📡 Testing basic connection...');
    const { data, error } = await supabase.from('streaks').select('*').limit(1);
    
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      if (error.message.includes('permission denied')) {
        console.log('💡 This might be due to RLS policies - that\'s actually good!');
      }
    } else {
      console.log('✅ Connection successful!', data);
    }
    
    // Test auth endpoint specifically
    console.log('\n🔐 Testing auth endpoint...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Auth endpoint test failed:', authError.message);
    } else {
      console.log('✅ Auth endpoint accessible!');
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

// Only run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  testSupabaseConnection();
}

export { testSupabaseConnection };
