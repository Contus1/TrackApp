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
    if (dayStreaks.length === 0) return 'bg-gray-200';
    
    const avgMood = dayStreaks.reduce((sum, streak) => {
      const moodValue = streak.mood === 'good' ? 3 : streak.mood === 'okay' ? 2 : 1;
      return sum + moodValue;
    }, 0) / dayStreaks.length;
    
    if (avgMood >= 2.5) return 'bg-gradient-to-t from-green-400 to-green-500';
    if (avgMood >= 1.5) return 'bg-gradient-to-t from-orange-400 to-orange-500';
    return 'bg-gradient-to-t from-red-400 to-red-500';
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
      case 'good': return '😊';
      case 'okay': return '🙂';
      case 'bad': return '😐';
      default: return '🙂';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Last 7 Days</h3>
        <div className="flex justify-between items-end h-24 bg-gray-50 rounded-2xl p-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="w-8 bg-gray-200 rounded-t animate-pulse" style={{ height: '40px' }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Last 7 Days</h3>
      
      {/* Graph */}
      <div className="bg-gray-50 rounded-2xl p-4">
        <div className="flex justify-between items-end h-24 mb-4">
          {days.map((day) => {
            const dayStreaks = getStreaksForDay(day.date);
            const barHeight = getBarHeight(dayStreaks);
            const barColor = getBarColor(dayStreaks);
            
            return (
              <div key={day.date} className="flex flex-col items-center">
                <button
                  onClick={() => setSelectedDay(selectedDay === day.date ? null : day.date)}
                  className={`w-8 rounded-t-lg transition-all duration-200 hover:opacity-80 ${barColor} ${
                    selectedDay === day.date ? 'ring-2 ring-orange-400' : ''
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
                  <div className="text-xs text-gray-600">{day.dayName}</div>
                  <div className={`text-xs font-medium ${day.isToday ? 'text-orange-600' : 'text-gray-500'}`}>
                    {day.dayNumber}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="text-xs text-gray-500 text-center">
          Tap on a day for details
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDay && (
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-900">
              {new Date(selectedDay).toLocaleDateString('en-US', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </h4>
            <button
              onClick={() => setSelectedDay(null)}
              className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>
          
          {getStreaksForDay(selectedDay).length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No workouts on this day
            </p>
          ) : (
            <div className="space-y-3">
              {getStreaksForDay(selectedDay).map((streak, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getSportEmoji(streak.sport)}</span>
                    <div>
                      <div className="font-medium text-gray-900 capitalize">
                        {streak.sport}
                        {streak.category && ` • ${streak.category}`}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <span className="mr-1">{getMoodEmoji(streak.mood)}</span>
                        {streak.mood}
                      </div>
                    </div>
                  </div>
                  
                  {onDeleteStreak && (
                    <button
                      onClick={() => onDeleteStreak(streak)}
                      className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 transition-colors"
                    >
                      🗑️
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
