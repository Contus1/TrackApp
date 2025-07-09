import React from 'react';
import type { Streak } from '../types/streaks';
import { MOOD_OPTIONS } from '../types/streaks';

interface TimelineProps {
  streaks: Streak[];
  isLoading?: boolean;
  onEditStreak?: (streak: Streak) => void;
  onDeleteStreak?: (streakId: string) => void;
}

const Timeline: React.FC<TimelineProps> = ({ 
  streaks, 
  isLoading = false, 
  onEditStreak, 
  onDeleteStreak 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Heute';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Gestern';
    } else {
      return date.toLocaleDateString('de-DE', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  const getSportEmoji = (sport: string) => {
    switch (sport) {
      case 'gym': return '💪';
      case 'laufen': return '🏃';
      case 'yoga': return '🧘';
      case 'schwimmen': return '🏊';
      case 'radfahren': return '🚴';
      default: return '⚡';
    }
  };

  const getMoodEmoji = (mood: string) => {
    return MOOD_OPTIONS.find(option => option.value === mood)?.emoji || '😐';
  };

  const getCategoryText = (sport: string, category?: string) => {
    if (sport === 'gym' && category) {
      return ` • ${category.charAt(0).toUpperCase() + category.slice(1)}`;
    }
    return '';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
      
      {streaks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-3xl mb-2">📅</div>
          <p className="text-sm">Noch keine Trainings-Einträge</p>
          <p className="text-xs text-gray-400 mt-1">
            Füge dein erstes Training hinzu!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {streaks.map((streak, index) => (
            <div 
              key={streak.id} 
              className="flex gap-4 group hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              {/* Sport Icon */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xl">
                  {getSportEmoji(streak.sport)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 capitalize">
                        {streak.sport}
                        {getCategoryText(streak.sport, streak.category)}
                      </h4>
                      <span className="text-lg">{getMoodEmoji(streak.mood)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(streak.date)}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEditStreak && (
                      <button
                        onClick={() => onEditStreak(streak)}
                        className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                        title="Bearbeiten"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                    {onDeleteStreak && (
                      <button
                        onClick={() => onDeleteStreak(streak.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Löschen"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Timeline Line */}
                {index < streaks.length - 1 && (
                  <div className="absolute left-10 mt-4 w-0.5 h-6 bg-gray-200"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Timeline;
