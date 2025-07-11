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

  try {
    return <AppRouter />;
  } catch (error) {
    console.error('❌ App error:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔥</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">TrackApp</h1>
          <p className="text-gray-600 mb-6">
            Something went wrong loading the app. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all"
          >
            Refresh App
          </button>
        </div>
      </div>
    );
  }
}

export default App;
