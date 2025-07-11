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
    <div className="bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden mobile-card">
      {/* Background pattern for premium look */}
      <div className="absolute inset-0 bg-white opacity-5 rounded-2xl"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-16 translate-x-16"></div>
      
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
              <div className="w-8 h-10 sm:w-12 sm:h-16 flex items-center justify-center">
                <span className="text-3xl sm:text-4xl opacity-60">🔥</span>
              </div>
            )}
          </div>
          
          <div className="text-center">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-10 w-20 bg-white bg-opacity-30 rounded-xl mb-2"></div>
                <div className="h-5 w-24 bg-white bg-opacity-30 rounded-lg"></div>
              </div>
            ) : (
              <>
                <div className="text-4xl sm:text-5xl font-bold tracking-tight mb-1">
                  {currentStreak}
                </div>
                <div className="text-sm sm:text-base opacity-90 font-medium">
                  {currentStreak === 1 ? 'Day' : 'Days'} Streak
                </div>
              </>
            )}
          </div>
        </div>
        
        {!isLoading && (
          <div className="mt-6 text-center text-sm sm:text-base opacity-90 font-medium">
            {currentStreak === 0 && "Light your fire! Start today! �"}
            {currentStreak > 0 && currentStreak < 7 && "Building momentum! 🌟"}
            {currentStreak >= 7 && currentStreak < 30 && "Blazing hot! Keep burning! 🔥"}
            {currentStreak >= 30 && "Unstoppable force! 👑"}
          </div>
        )}
      </div>
    </div>
  );
};

export default StreakDisplay;
