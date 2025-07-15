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
    <div className="relative p-4 sm:p-6 overflow-hidden text-white shadow-xl bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 rounded-2xl">
      {/* Background pattern for premium look */}
      <div className="absolute inset-0 bg-white opacity-5 rounded-2xl"></div>
      <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 translate-x-12 sm:translate-x-16 -translate-y-12 sm:-translate-y-16 bg-white rounded-full opacity-5"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-center space-x-3 sm:space-x-6">
          {/* Animated Flame */}
          <div className="relative">
            {currentStreak > 0 ? (
              <AnimatedFlame 
                size={getFlameSize()} 
                intensity={getFlameIntensity()}
                className="drop-shadow-lg"
              />
            ) : (
              <div className="flex items-center justify-center w-6 h-8 sm:w-12 sm:h-16">
                <span className="text-2xl sm:text-4xl opacity-60">🔥</span>
              </div>
            )}
          </div>
          
          <div className="text-center">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="w-16 h-8 sm:w-20 sm:h-10 mb-2 bg-white bg-opacity-30 rounded-xl"></div>
                <div className="w-20 h-4 sm:w-24 sm:h-5 bg-white rounded-lg bg-opacity-30"></div>
              </div>
            ) : (
              <>
                <div className="mb-1 text-3xl sm:text-5xl font-bold tracking-tight">
                  {currentStreak}
                </div>
                <div className="text-sm sm:text-base font-medium opacity-90">
                  {currentStreak === 1 ? 'Day' : 'Days'} Streak
                </div>
              </>
            )}
          </div>
        </div>
        
        {!isLoading && (
          <div className="mt-4 sm:mt-6 text-xs sm:text-base font-medium text-center opacity-90">
            {currentStreak === 0 && "Light your fire! Start today! 🚀"}
            {currentStreak > 0 && currentStreak < 7 && "Building momentum! 🌟"}
            {currentStreak >= 7 && currentStreak < 30 && "Blazing hot! Keep burning! 🔥"}
            {currentStreak >= 30 && "Unstoppable force! 👑"}
          </div>
        )}
        
        {/* Streak Rules Info */}
        {!isLoading && (
          <div className="mt-3 sm:mt-4 text-xs text-center opacity-75 space-y-1">
            <p>🏆 One activity per day = one flame</p>
            <p>⚠️ Streak breaks after 3 days of inactivity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreakDisplay;
