import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="px-6 py-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 mb-6">
          <span className="text-2xl">🔥</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          TrackApp
        </h1>
        <p className="text-lg text-gray-600 max-w-sm mx-auto">
          Verfolge deine Fitness-Streaks und motiviere dich mit Freunden
        </p>
      </header>

      {/* Hero Section */}
      <div className="px-6 py-16">
        <div className="max-w-sm mx-auto text-center space-y-12">
          
          {/* Feature Cards */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Streak Tracking
              </h3>
              <p className="text-gray-600 text-sm">
                Verfolge deine täglichen Trainings und baue längere Streaks auf
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">👥</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Freunde motivieren
              </h3>
              <p className="text-gray-600 text-sm">
                Lade Freunde ein und vergleiche eure Fitness-Streaks
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Einfach & Schnell
              </h3>
              <p className="text-gray-600 text-sm">
                Minimalistisches Design für maximale Motivation
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-8">
            <button
              onClick={onGetStarted}
              className="w-full py-4 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Jetzt starten
            </button>
            
            <p className="text-xs text-gray-500 mt-4">
              Kostenlos • Keine Werbung • Einfach zu verwenden
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-8 text-center">
        <p className="text-xs text-gray-400">
          Made with 🔥 for fitness enthusiasts
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
