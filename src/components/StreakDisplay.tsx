import React from 'react';
import AnimatedFlame from './AnimatedFlame';

interface StreakDisplayProps {
  currentStreak: number;
  isLoading?: boolean;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ currentStreak, isLoading = false }) => {
  // Determine flame intensity based on streak length
  const getFlameIntensity = () => {
    if (currentStreak === 0) return 'low';
    if (currentStreak < 7) return 'medium';
    if (currentStreak < 30) return 'high';
    return 'high';
  };

  const getFlameSize = () => {
    if (currentStreak < 7) return 'md';
    if (currentStreak < 30) return 'lg';
    return 'lg';
  };

  return (
    <div className="relative p-6 overflow-hidden text-white shadow-xl bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 rounded-2xl mobile-card">
      {/* Background pattern for premium look */}
      <div className="absolute inset-0 bg-white opacity-5 rounded-2xl"></div>
      <div className="absolute top-0 right-0 w-32 h-32 translate-x-16 -translate-y-16 bg-white rounded-full opacity-5"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-center space-x-4 sm:space-x-6">
          {/* Animated Flame */}
          <div className="relative">
            {currentStreak > 0 ? (
              <AnimatedFlame 
                size={getFlameSize()} 
                intensity={getFlameIntensity()}
                className="drop-shadow-lg"
              />
            ) : (
              <div className="flex items-center justify-center w-8 h-10 sm:w-12 sm:h-16">
                <span className="text-3xl sm:text-4xl opacity-60">🔥</span>
              </div>
            )}
          </div>
          
          <div className="text-center">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="w-20 h-10 mb-2 bg-white bg-opacity-30 rounded-xl"></div>
                <div className="w-24 h-5 bg-white rounded-lg bg-opacity-30"></div>
              </div>
            ) : (
              <>
                <div className="mb-1 text-4xl font-bold tracking-tight sm:text-5xl">
                  {currentStreak}
                </div>
                <div className="text-sm font-medium sm:text-base opacity-90">
                  {currentStreak === 1 ? 'Day' : 'Days'} Streak
                </div>
              </>
            )}
          </div>
        </div>
        
        {!isLoading && (
          <div className="mt-6 text-sm font-medium text-center sm:text-base opacity-90">
            {currentStreak === 0 && "Light your fire! Start today! 🚀"}
            {currentStreak > 0 && currentStreak < 7 && "Building momentum! 🌟"}
            {currentStreak >= 7 && currentStreak < 30 && "Blazing hot! Keep burning! 🔥"}
            {currentStreak >= 30 && "Unstoppable force! 👑"}
          </div>
        )}
        
        {/* Streak Rules Info */}
        {!isLoading && (
          <div className="mt-4 text-xs text-center opacity-75">
            <p>🏆 One activity per day = one flame</p>
            <p>⚠️ Streak breaks after 3 days of inactivity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreakDisplay;
