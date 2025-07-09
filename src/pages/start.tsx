import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface StartPageProps {
  onNavigate: (page: 'start' | 'login' | 'register' | 'dashboard') => void;
}

const StartPage: React.FC<StartPageProps> = ({ onNavigate }) => {
  const handleGetStarted = () => {
    onNavigate('register');
  };

  const handleLogin = () => {
    onNavigate('login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
      <Header title="TrackApp" />
      
      <main className="flex-1 flex flex-col justify-center">
        <div className="mobile-container text-center text-white">
          {/* Hero Section */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-4xl">💪</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Willkommen bei TrackApp
            </h1>
            <p className="text-lg sm:text-xl text-primary-100 mb-8">
              Verfolgen Sie Ihre Fitness-Ziele und bleiben Sie motiviert
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-12">
            <div className="flex items-center text-left">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <h3 className="font-semibold">Trainings verfolgen</h3>
                <p className="text-sm text-primary-100">Übungen, Sätze und Wiederholungen dokumentieren</p>
              </div>
            </div>
            
            <div className="flex items-center text-left">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <span className="text-xl">📈</span>
              </div>
              <div>
                <h3 className="font-semibold">Fortschritt sehen</h3>
                <p className="text-sm text-primary-100">Visualisieren Sie Ihre Verbesserungen</p>
              </div>
            </div>
            
            <div className="flex items-center text-left">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <span className="text-xl">🎯</span>
              </div>
              <div>
                <h3 className="font-semibold">Ziele erreichen</h3>
                <p className="text-sm text-primary-100">Setzen und verfolgen Sie Ihre Fitness-Ziele</p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleGetStarted}
              className="w-full bg-white text-primary-600 font-semibold py-4 px-6 rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
            >
              Jetzt starten
            </button>
            <button
              onClick={handleLogin}
              className="w-full bg-transparent border-2 border-white text-white font-semibold py-4 px-6 rounded-lg hover:bg-white/10 transition-colors"
            >
              Bereits registriert? Anmelden
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default StartPage;
