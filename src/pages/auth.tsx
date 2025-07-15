import React, { useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

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
  const flameTrailRef = useRef<HTMLDivElement>(null);
  const magneticButtonRef = useRef<HTMLButtonElement>(null);

  // Advanced flame cursor trail effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (flameTrailRef.current) {
        const flame = document.createElement('div');
        flame.className = 'flame-trail';
        flame.style.left = e.clientX + 'px';
        flame.style.top = e.clientY + 'px';
        flame.innerHTML = '🔥';
        flameTrailRef.current.appendChild(flame);
        
        setTimeout(() => {
          if (flame.parentNode) {
            flame.parentNode.removeChild(flame);
          }
        }, 1500);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Magnetic button effect
  useEffect(() => {
    const button = magneticButtonRef.current;
    if (!button) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const distance = Math.sqrt(x * x + y * y);
      const maxDistance = 100;
      
      if (distance < maxDistance) {
        const strength = (maxDistance - distance) / maxDistance * 20;
        button.style.transform = `translate(${x * strength / maxDistance}px, ${y * strength / maxDistance}px) scale(1.05)`;
      }
    };

    const handleMouseLeave = () => {
      button.style.transform = 'translate(0px, 0px) scale(1)';
    };

    document.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      button?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Show configuration error if Supabase is not properly set up
  if (!isSupabaseConfigured) {
    return (
      <>
        {/* Flame trail container */}
        <div ref={flameTrailRef} className="pointer-events-none fixed inset-0 z-50">
          <style>{`
            .flame-trail {
              position: absolute;
              animation: flameTrail 1.5s ease-out forwards;
              pointer-events: none;
              font-size: 16px;
              z-index: 9999;
            }
            @keyframes flameTrail {
              0% { opacity: 0.8; transform: scale(1) rotate(0deg); }
              50% { opacity: 0.6; transform: scale(1.2) rotate(180deg); }
              100% { opacity: 0; transform: scale(0.3) rotate(360deg) translateY(-30px); }
            }
          `}</style>
        </div>

        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          {/* Floating orbs background */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-orange-400 to-rose-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
            <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-80 h-80 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>

          {/* Additional CSS for blob animation */}
          <style>{`
            @keyframes blob {
              0% { transform: translate(0px, 0px) scale(1); }
              33% { transform: translate(30px, -50px) scale(1.1); }
              66% { transform: translate(-20px, 20px) scale(0.9); }
              100% { transform: translate(0px, 0px) scale(1); }
            }
            .animate-blob { animation: blob 7s infinite; }
            .animation-delay-2000 { animation-delay: 2s; }
            .animation-delay-4000 { animation-delay: 4s; }
          `}</style>

          <div className="relative z-10">
            <div className="relative group max-w-md w-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
                <div className="text-6xl mb-6">⚙️</div>
                <h1 className="text-2xl font-bold text-white mb-4">Setup Required</h1>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  The app needs to be configured with Supabase credentials to enable authentication and data storage.
                </p>
                
                <div className="bg-orange-500/20 border border-orange-400/30 rounded-2xl p-4 mb-6 text-left">
                  <h3 className="font-semibold text-orange-300 mb-2">Missing Environment Variables:</h3>
                  <ul className="text-sm text-orange-200 space-y-1">
                    <li>• VITE_SUPABASE_URL</li>
                    <li>• VITE_SUPABASE_ANON_KEY</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  {onBack && (
                    <button 
                      onClick={onBack}
                      className="w-full bg-white/10 hover:bg-white/20 text-gray-300 px-6 py-3 rounded-xl font-semibold transition-all border border-white/20"
                    >
                      ← Back to App
                    </button>
                  )}
                  <button 
                    onClick={() => window.open('https://supabase.com', '_blank')}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
                  >
                    Get Supabase Setup Guide
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
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
      console.log('🌐 Using Supabase config from:', process.env.REACT_APP_SUPABASE_URL);
      
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
        
        // Create profile immediately after successful signup
        if (data.user) {
          try {
            const friendCode = generateFriendCode();
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                display_name: displayName.trim() || email.split('@')[0],
                friend_code: friendCode
              });
            
            if (profileError) {
              console.warn('Profile creation failed, but user was created:', profileError);
            } else {
              console.log('✅ Profile created with friend code:', friendCode);
            }
          } catch (profileError) {
            console.warn('Profile creation error:', profileError);
          }
        }
        
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

  // Generate friend code
  const generateFriendCode = (): string => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    return letters.charAt(Math.floor(Math.random() * letters.length)) +
           letters.charAt(Math.floor(Math.random() * letters.length)) +
           numbers.charAt(Math.floor(Math.random() * numbers.length)) +
           numbers.charAt(Math.floor(Math.random() * numbers.length)) +
           numbers.charAt(Math.floor(Math.random() * numbers.length)) +
           numbers.charAt(Math.floor(Math.random() * numbers.length));
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
    <>
      {/* Flame trail container */}
      <div ref={flameTrailRef} className="pointer-events-none fixed inset-0 z-50">
        <style>{`
          .flame-trail {
            position: absolute;
            animation: flameTrail 1.5s ease-out forwards;
            pointer-events: none;
            font-size: 16px;
            z-index: 9999;
          }
          @keyframes flameTrail {
            0% { opacity: 0.8; transform: scale(1) rotate(0deg); }
            50% { opacity: 0.6; transform: scale(1.2) rotate(180deg); }
            100% { opacity: 0; transform: scale(0.3) rotate(360deg) translateY(-30px); }
          }
        `}</style>
      </div>

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
        {/* Floating orbs background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-orange-400 to-rose-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-80 h-80 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Additional CSS for blob animation */}
        <style>{`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
        `}</style>

        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Header */}
          <header className="px-6 py-12 text-center">
            {onBack && (
              <button
                onClick={onBack}
                className="absolute left-6 top-12 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg flex items-center justify-center text-gray-300 hover:bg-white/20 transition-all"
              >
                ←
              </button>
            )}
            
            <div className="relative inline-flex items-center justify-center w-20 h-20 mb-8 overflow-hidden rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 shadow-xl">
              <div className="absolute inset-0 bg-white opacity-20 rounded-full animate-pulse"></div>
              <span className="relative z-10 text-3xl animate-bounce">🔥</span>
            </div>
            <h1 className="text-4xl font-black text-transparent bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 bg-clip-text mb-4 tracking-tight">
              {isLogin ? 'Welcome back!' : 'Create account'}
            </h1>
            <p className="text-lg text-gray-300">
              {isLogin ? 'Great to see you again' : 'Let\'s get started together!'}
            </p>
          </header>

          {/* Auth Form */}
          <div className="flex-1 px-6 py-8">
            <div className="max-w-sm mx-auto">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">
                          What should we call you?
                        </label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-white placeholder-gray-400 backdrop-blur-xl"
                          placeholder="e.g. John Doe"
                          required
                        />
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-white placeholder-gray-400 backdrop-blur-xl"
                        placeholder="your@email.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-white placeholder-gray-400 backdrop-blur-xl"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 rounded-3xl blur-lg opacity-50 animate-pulse"></div>
                      <button
                        ref={magneticButtonRef}
                        type="submit"
                        disabled={loading}
                        className="relative w-full py-5 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white font-bold text-lg rounded-3xl shadow-2xl transition-all duration-300 transform hover:shadow-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-95 border border-white/20"
                        style={{ transition: 'transform 0.1s ease-out' }}
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Loading...
                          </div>
                        ) : (
                          <span className="relative z-10 flex items-center justify-center space-x-3">
                            <span>{isLogin ? 'Sign In' : 'Register'}</span>
                            <span className="text-xl animate-bounce">{isLogin ? '🚀' : '⭐'}</span>
                          </span>
                        )}
                      </button>
                    </div>
                  </form>

                  {message && (
                    <div className={`mt-6 p-4 rounded-2xl text-sm border ${
                      message.includes('Great!') 
                        ? 'bg-green-500/20 border-green-400/30 text-green-300' 
                        : 'bg-red-500/20 border-red-400/30 text-red-300'
                    }`}>
                      {message}
                    </div>
                  )}

                  <div className="mt-8 text-center">
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-orange-300 hover:text-orange-200 font-semibold transition-colors"
                    >
                      {isLogin ? 'No account yet? Register' : 'Already registered? Sign In'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthPage;
