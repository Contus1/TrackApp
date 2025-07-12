import { useEffect } from 'react';
import AppRouter from './components/AppRouter';
import './styles/globals.css';
import { pwaService } from './services/pwaService';
import { isSupabaseConfigured } from './services/supabase';

function App() {
  useEffect(() => {
    // Initialize PWA service
    console.log('🔥 TrackApp starting...');
    console.log('📱 PWA Service initialized:', pwaService.isAppInstalled());
    console.log('🔗 Supabase configured:', isSupabaseConfigured);
    
    if (!isSupabaseConfigured) {
      console.warn('⚠️ App running without backend - some features will be limited');
    }
  }, []);

  return <AppRouter />;
}

export default App;
