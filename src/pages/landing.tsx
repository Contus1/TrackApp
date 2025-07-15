import React, { useEffect, useRef } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
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

  return (
    <>
      {/* Flame trail container */}
      <div ref={flameTrailRef} className="fixed inset-0 z-50 pointer-events-none">
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

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Floating orbs background */}
        <div className="absolute inset-0">
          <div className="absolute rounded-full top-20 left-10 w-72 h-72 bg-gradient-to-r from-orange-400 to-rose-400 mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute rounded-full top-40 right-10 w-96 h-96 bg-gradient-to-r from-yellow-400 to-orange-400 mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute rounded-full -bottom-8 left-20 w-80 h-80 bg-gradient-to-r from-rose-400 to-pink-400 mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
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
            <div className="relative inline-flex items-center justify-center w-20 h-20 mb-8 overflow-hidden rounded-full shadow-xl bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500">
              <div className="absolute inset-0 bg-white rounded-full opacity-20 animate-pulse"></div>
              <span className="relative z-10 text-3xl animate-bounce">🔥</span>
            </div>
            <h1 className="mb-4 text-5xl font-black tracking-tight text-transparent bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 bg-clip-text">
              TrackApp
            </h1>
            <p className="max-w-md mx-auto text-xl leading-relaxed text-gray-300">
              Track streaks, crush goals, outshine friends
            </p>
          </header>

          {/* Main Content */}
          <div className="flex-1 px-6 py-8">
            <div className="max-w-sm mx-auto space-y-8">
              
              {/* Feature Cards with glassmorphism */}
              <div className="space-y-6">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative p-6 transition-all duration-300 border shadow-2xl bg-white/10 backdrop-blur-xl rounded-3xl border-white/20 hover:shadow-orange-500/25 hover:scale-105">
                    <div className="flex items-center justify-center mx-auto mb-4 rounded-full shadow-lg w-14 h-14 bg-gradient-to-br from-orange-400 to-red-500">
                      <span className="text-2xl">📊</span>
                    </div>
                    <h3 className="mb-3 text-lg font-bold text-white">
                      Smart Streaks
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-300">
                      Track daily workouts with intelligent consecutive day counting and 3-day grace periods
                    </p>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative p-6 transition-all duration-300 border shadow-2xl bg-white/10 backdrop-blur-xl rounded-3xl border-white/20 hover:shadow-red-500/25 hover:scale-105">
                    <div className="flex items-center justify-center mx-auto mb-4 rounded-full shadow-lg w-14 h-14 bg-gradient-to-br from-red-400 to-orange-500">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <h3 className="mb-3 text-lg font-bold text-white">
                      Beat Friends
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-300">
                      Invite friends, compare streaks, and fuel your competitive spirit
                    </p>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative p-6 transition-all duration-300 border shadow-2xl bg-white/10 backdrop-blur-xl rounded-3xl border-white/20 hover:shadow-yellow-500/25 hover:scale-105">
                    <div className="flex items-center justify-center mx-auto mb-4 rounded-full shadow-lg w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h3 className="mb-3 text-lg font-bold text-white">
                      Stay Focused
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-300">
                      Minimalist design that keeps you motivated without distractions
                    </p>
                  </div>
                </div>
              </div>

              {/* Magnetic CTA Button */}
              <div className="pt-8">
                <div className="relative">
                  <div className="absolute opacity-50 -inset-1 bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 rounded-3xl blur-lg animate-pulse"></div>
                  <button
                    ref={magneticButtonRef}
                    onClick={onGetStarted}
                    className="relative w-full py-5 text-lg font-bold text-white transition-all duration-300 transform border shadow-2xl cursor-pointer bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 rounded-3xl hover:shadow-orange-500/50 active:scale-95 border-white/20"
                    style={{ transition: 'transform 0.1s ease-out' }}
                  >
                    <span className="relative z-10 flex items-center justify-center space-x-3">
                      <span>Start Your Journey</span>
                      <span className="text-2xl animate-bounce">🚀</span>
                    </span>
                  </button>
                </div>
                
                <p className="mt-6 text-xs leading-relaxed text-center text-gray-400">
                  Free • No Ads • Pure Motivation
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="px-6 py-8 text-center">
            <p className="text-sm font-medium text-center text-transparent bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text">
            © 2025 TrackApp. Made with 💜 in Madrid by Carl Lichtl!
          </p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
