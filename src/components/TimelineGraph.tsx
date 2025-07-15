import React, { useState } from 'react';
import type { Streak } from '../types/streaks';

interface TimelineGraphProps {
  streaks: Streak[];
  isLoading?: boolean;
  onDeleteStreak?: (streak: Streak) => void;
}

const TimelineGraph: React.FC<TimelineGraphProps> = ({ 
  streaks, 
  isLoading = false, 
  onDeleteStreak 
}) => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Create 7-day data (today backwards)
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        isToday: i === 0
      });
    }
    return days;
  };

  const days = getLast7Days();

  // Find streaks for each day
  const getStreaksForDay = (date: string) => {
    return streaks.filter(streak => streak.date === date);
  };

  // Calculate bar height based on number of workouts
  const getBarHeight = (dayStreaks: Streak[]) => {
    const count = dayStreaks.length;
    if (count === 0) return 8; // Minimum for empty day
    return Math.min(8 + (count * 16), 64); // Max 64px
  };

  // Choose color based on mood
  const getBarColor = (dayStreaks: Streak[]) => {
    if (dayStreaks.length === 0) return 'bg-white/10 border border-white/20';
    
    const avgMood = dayStreaks.reduce((sum, streak) => {
      const moodValue = streak.mood === 'gut' ? 3 : streak.mood === 'mittel' ? 2 : 1;
      return sum + moodValue;
    }, 0) / dayStreaks.length;
    
    if (avgMood >= 2.5) return 'bg-gradient-to-t from-green-400/80 to-green-500/80 border border-green-400/30 shadow-lg shadow-green-500/20';
    if (avgMood >= 1.5) return 'bg-gradient-to-t from-orange-400/80 to-orange-500/80 border border-orange-400/30 shadow-lg shadow-orange-500/20';
    return 'bg-gradient-to-t from-red-400/80 to-red-500/80 border border-red-400/30 shadow-lg shadow-red-500/20';
  };

  const getSportEmoji = (sport: string) => {
    switch (sport) {
      case 'gym': return '🏋️';
      case 'running': return '🏃';
      case 'cycling': return '🚴';
      case 'swimming': return '🏊';
      case 'hiking': return '🥾';
      case 'yoga': return '🧘';
      case 'other': return '💪';
      default: return '💪';
    }
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'gut': return '😊';
      case 'mittel': return '�';
      case 'schlecht': return '�';
      default: return '�';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-end h-24 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="w-6 sm:w-8 bg-white/20 rounded-t animate-pulse" style={{ height: '40px' }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Graph */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
        <div className="flex justify-between items-end h-20 sm:h-24 mb-4">
          {days.map((day) => {
            const dayStreaks = getStreaksForDay(day.date);
            const barHeight = getBarHeight(dayStreaks);
            const barColor = getBarColor(dayStreaks);
            
            return (
              <div key={day.date} className="flex flex-col items-center">
                <button
                  onClick={() => setSelectedDay(selectedDay === day.date ? null : day.date)}
                  className={`w-6 sm:w-8 rounded-t-2xl transition-all duration-200 hover:opacity-80 backdrop-blur-sm ${barColor} ${
                    selectedDay === day.date ? 'ring-2 ring-orange-400 ring-offset-2 ring-offset-transparent' : ''
                  }`}
                  style={{ height: `${barHeight}px` }}
                >
                  {dayStreaks.length > 0 && (
                    <div className="text-xs text-white font-bold pt-1">
                      {dayStreaks.length}
                    </div>
                  )}
                </button>
                
                <div className="mt-2 text-center">
                  <div className="text-xs text-gray-300">{day.dayName}</div>
                  <div className={`text-xs font-medium ${day.isToday ? 'text-orange-400' : 'text-gray-400'}`}>
                    {day.dayNumber}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="text-xs text-gray-400 text-center">
          Tap on a day for details
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDay && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-white">
              {new Date(selectedDay).toLocaleDateString('en-US', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </h4>
            <button
              onClick={() => setSelectedDay(null)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {getStreaksForDay(selectedDay).length === 0 ? (
            <p className="text-gray-400 text-center py-4">
              No workouts on this day
            </p>
          ) : (
            <div className="space-y-3">
              {getStreaksForDay(selectedDay).map((streak, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getSportEmoji(streak.sport)}</span>
                    <div>
                      <div className="font-medium text-white capitalize">
                        {streak.sport}
                        {streak.category && ` • ${streak.category}`}
                      </div>
                      <div className="text-sm text-gray-300 flex items-center">
                        <span className="mr-1">{getMoodEmoji(streak.mood)}</span>
                        {streak.mood}
                      </div>
                    </div>
                  </div>
                  
                  {onDeleteStreak && (
                    <button
                      onClick={() => onDeleteStreak(streak)}
                      className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors border border-red-500/30"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TimelineGraph;
