import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface RegisterPageProps {
  onNavigate: (page: 'start' | 'login' | 'register' | 'dashboard') => void;
  onRegister: (userData: any) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate, onRegister }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwörter stimmen nicht überein');
      return;
    }

    if (!formData.acceptTerms) {
      alert('Bitte akzeptieren Sie die Nutzungsbedingungen');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulation einer API-Anfrage
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Rufe die onRegister-Funktion aus App.tsx auf
      onRegister(formData);
      
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    onNavigate('login');
  };

  const handleBack = () => {
    onNavigate('start');
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
            <button
              onClick={handleBack}
              className="absolute left-6 top-12 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg flex items-center justify-center text-gray-300 hover:bg-white/20 transition-all"
            >
              ←
            </button>
            
            <div className="relative inline-flex items-center justify-center w-20 h-20 mb-8 overflow-hidden rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 shadow-xl">
              <div className="absolute inset-0 bg-white opacity-20 rounded-full animate-pulse"></div>
              <span className="relative z-10 text-3xl animate-bounce">💪</span>
            </div>
            <h1 className="text-4xl font-black text-transparent bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 bg-clip-text mb-4 tracking-tight">
              Create Account
            </h1>
            <p className="text-lg text-gray-300">
              Start now and get your lazy friends to join you!
            </p>
          </header>

          {/* Main Content */}
          <div className="flex-1 px-6 py-8">
            <div className="max-w-sm mx-auto">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                  {/* Registration Form */}
                  <form onSubmit={handleRegister} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="firstName" className="block mb-2 text-sm font-medium text-gray-300">
                          Firstnam
                        </label>
                        <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-white placeholder-gray-400 backdrop-blur-xl"
                          placeholder="Joe"
                          required
                          autoComplete="given-name"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block mb-2 text-sm font-medium text-gray-300">
                          Lastname
                        </label>
                        <input
                          id="lastName"
                          name="lastName"
                          type="text"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-white placeholder-gray-400 backdrop-blur-xl"
                          placeholder="Mama"
                          required
                          autoComplete="family-name"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-300">
                        E-Mail-Adress
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-white placeholder-gray-400 backdrop-blur-xl"
                        placeholder="max.mustermann@beispiel.de"
                        required
                        autoComplete="email"
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-300">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-white placeholder-gray-400 backdrop-blur-xl"
                          placeholder="Mindestens 8 Zeichen"
                          required
                          minLength={8}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-200"
                          aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                        >
                          {showPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-300">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-white placeholder-gray-400 backdrop-blur-xl"
                          placeholder="Passwort wiederholen"
                          required
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-200"
                          aria-label={showConfirmPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                        >
                          {showConfirmPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <input
                        id="acceptTerms"
                        name="acceptTerms"
                        type="checkbox"
                        checked={formData.acceptTerms}
                        onChange={handleInputChange}
                        className="w-4 h-4 mt-1 border-gray-300 rounded text-orange-500 focus:ring-orange-500 bg-white/10"
                        required
                      />
                      <label htmlFor="acceptTerms" className="block ml-3 text-sm text-gray-300">
                        I accept{' '}
                        <a href="#" className="text-orange-400 hover:text-orange-300">
                          Terms
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-orange-400 hover:text-orange-300">
                          Conditions
                        </a>
                      </label>
                    </div>

                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 rounded-3xl blur-lg opacity-50 animate-pulse"></div>
                      <button
                        ref={magneticButtonRef}
                        type="submit"
                        disabled={isLoading}
                        className="relative w-full py-5 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white font-bold text-lg rounded-3xl shadow-2xl transition-all duration-300 transform hover:shadow-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-95 border border-white/20"
                        style={{ transition: 'transform 0.1s ease-out' }}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="w-5 h-5 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                            Register...
                          </div>
                        ) : (
                          <span className="relative z-10 flex items-center justify-center space-x-3">
                            <span>Konto erstellen</span>
                            <span className="text-xl animate-bounce">⭐</span>
                          </span>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Login Link */}
                  <div className="mt-8 text-center">
                    <p className="text-gray-300">
                      You got already an Account{' '}
                      <button
                        onClick={handleGoToLogin}
                        className="font-medium text-orange-400 hover:text-orange-300"
                      >
                        Join Now
                      </button>
                    </p>
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

export default RegisterPage;
