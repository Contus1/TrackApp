import React from 'react';

interface StreakDisplayProps {
  currentStreak: number;
  isLoading?: boolean;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ currentStreak, isLoading = false }) => {
  return (
    <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-center space-x-4">
        <div className="text-4xl">🔥</div>
        <div className="text-center">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-8 w-16 bg-white bg-opacity-30 rounded mb-2"></div>
              <div className="h-4 w-20 bg-white bg-opacity-30 rounded"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold">{currentStreak}</div>
              <div className="text-sm opacity-90">
                {currentStreak === 1 ? 'Day' : 'Days'} Streak
              </div>
            </>
          )}
        </div>
      </div>
      
      {!isLoading && (
        <div className="mt-4 text-center text-sm opacity-90">
          {currentStreak === 0 && "Start your streak today! 💪"}
          {currentStreak > 0 && currentStreak < 7 && "You're on the right track! 🚀"}
          {currentStreak >= 7 && currentStreak < 30 && "Fantastic! Keep it up! ⭐"}
          {currentStreak >= 30 && "You're a legend! 👑"}
        </div>
      )}
    </div>
  );
};

export default StreakDisplay;
