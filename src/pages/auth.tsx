import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { SUPABASE_CONFIG } from '../config/supabase-config';

interface AuthPageProps {
  onLogin: () => void;
  onBack?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Show configuration error if Supabase is not properly set up
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full text-center">
          <div className="text-6xl mb-6">⚙️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Setup Required</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            The app needs to be configured with Supabase credentials to enable authentication and data storage.
          </p>
          
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6 text-left">
            <h3 className="font-semibold text-orange-800 mb-2">Missing Environment Variables:</h3>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• VITE_SUPABASE_URL</li>
              <li>• VITE_SUPABASE_ANON_KEY</li>
            </ul>
          </div>

          <div className="space-y-3">
            {onBack && (
              <button 
                onClick={onBack}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all"
              >
                ← Back to App
              </button>
            )}
            <button 
              onClick={() => window.open('https://supabase.com', '_blank')}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all"
            >
              Get Supabase Setup Guide
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      console.log('🔐 Starting authentication...', { 
        email, 
        isLogin, 
        userAgent: navigator.userAgent,
        browser: getBrowserInfo()
      });
      console.log('🌐 Using Supabase config from:', SUPABASE_CONFIG.url);
      
      // Browser-spezifische Workarounds
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isChrome = /chrome/i.test(navigator.userAgent);
      
      if (isSafari) {
        console.log('🦁 Safari detected - using compatibility mode');
      }
      if (isChrome) {
        console.log('🟢 Chrome detected - checking for blocking issues');
      }
      
      if (isLogin) {
        console.log('📝 Attempting sign in...');
        
        // Für Safari: Explizite Konfiguration
        const authOptions = isSafari ? {
          captchaToken: undefined,
        } : {};
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
          ...authOptions
        });
        
        console.log('📊 Sign in result:', { data, error });
        
        if (error) {
          throw error;
        }
        
        // Warte kurz damit Session richtig gesetzt wird
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('✅ Sign in successful!');
        onLogin();
      } else {
        console.log('📝 Attempting sign up...');
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              display_name: displayName.trim() || email.split('@')[0],
            },
            emailRedirectTo: window.location.origin + '/auth'
          },
        });
        
        console.log('📊 Sign up result:', { data, error });
        
        if (error) throw error;
        setMessage('Registrierung erfolgreich! Bestätige deine E-Mail-Adresse.');
      }
    } catch (error: unknown) {
      console.error('💥 Auth error details:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        browser: getBrowserInfo()
      });
      
      let errorMessage = 'Ein Fehler ist aufgetreten';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
          const browserInfo = getBrowserInfo();
          errorMessage = `Verbindung fehlgeschlagen (${browserInfo}).\n\nMögliche Lösungen:\n• Inkognito-Modus probieren\n• Browser-Cache leeren\n• Anderer Browser (funktioniert in Inkognito/Chrome Mobile)`;
          console.error('🌐 Browser-spezifisches Problem erkannt:', browserInfo);
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Ungültige E-Mail oder Passwort.';
        } else if (error.message.includes('Password should be at least 6 characters')) {
          errorMessage = 'Passwort muss mindestens 6 Zeichen lang sein.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Bitte gültige E-Mail-Adresse eingeben.';
        } else if (error.message.includes('User already registered')) {
          errorMessage = 'Account existiert bereits. Versuche dich anzumelden.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'E-Mail noch nicht bestätigt. Prüfe dein E-Mail-Postfach.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Browser-Info für Debugging
  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edg')) return 'Edge';
    return 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col">
      {/* Header */}
      <header className="px-6 py-8 text-center">
        {onBack && (
          <button
            onClick={onBack}
            className="absolute left-6 top-8 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ←
          </button>
        )}
        
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 mb-6">
          <span className="text-2xl">🔥</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isLogin ? 'Welcome back!' : 'Create account'}
        </h1>
        <p className="text-gray-600">
          {isLogin ? 'Great to see you again' : 'Let\'s get started together!'}
        </p>
      </header>

      {/* Auth Form */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-sm mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    What should we call you?
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Loading...
                  </div>
                ) : (
                  isLogin ? 'Sign In' : 'Register'
                )}
              </button>
            </form>

            {message && (
              <div className={`mt-6 p-4 rounded-2xl text-sm ${
                message.includes('Great!') 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {message}
              </div>
            )}

            <div className="mt-8 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
              >
                {isLogin ? 'No account yet? Register' : 'Already registered? Sign In'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
