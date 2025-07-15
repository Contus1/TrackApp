import React, { useState } from 'react';
import { SPORT_OPTIONS, GYM_CATEGORIES, MOOD_OPTIONS } from '../types/streaks';
import type { StreakInsert } from '../types/streaks';

interface StreakFormProps {
  onSubmit: (data: StreakInsert) => Promise<void>;
  onCancel: () => void;
  userId: string;
  isLoading?: boolean;
}

const StreakForm: React.FC<StreakFormProps> = ({ onSubmit, onCancel, userId, isLoading = false }) => {
  const [formData, setFormData] = useState({
    sport: '' as StreakInsert['sport'],
    category: '' as StreakInsert['category'],
    mood: '' as StreakInsert['mood']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sport || !formData.mood) {
      alert('Please fill in all required fields!');
      return;
    }

    const streakData: StreakInsert = {
      user_id: userId,
      date: new Date().toISOString().split('T')[0], // Today
      sport: formData.sport,
      category: formData.sport === 'gym' ? formData.category : undefined,
      mood: formData.mood
    };

    await onSubmit(streakData);
  };

  const handleSportChange = (sport: StreakInsert['sport']) => {
    setFormData(prev => ({
      ...prev,
      sport,
      category: sport !== 'gym' ? undefined : prev.category
    }));
  };

  return (
    <div className="w-full">
      {/* Scroll indicator for mobile */}
      <div className="hidden max-h-screen-check">
        <div className="absolute w-12 h-1 transform -translate-x-1/2 rounded-full top-2 left-1/2 bg-white/30 sm:hidden"></div>
      </div>
      
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl font-bold text-white sm:text-2xl">Add Workout</h2>
        <button
          onClick={onCancel}
          className="p-3 sm:p-2 text-gray-300 transition-colors hover:text-white rounded-2xl bg-white/10 hover:bg-white/20 min-w-[44px] min-h-[44px] flex items-center justify-center"
          disabled={isLoading}
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Sport Selection */}
          <div>
            <label className="block mb-2 text-sm font-medium text-white sm:text-base">
              Sport Type *
            </label>
            <select
              value={formData.sport}
              onChange={(e) => handleSportChange(e.target.value as StreakInsert['sport'])}
              className="w-full p-3 text-white placeholder-gray-300 transition-all duration-200 border sm:p-4 border-white/20 rounded-2xl bg-white/10 backdrop-blur-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
              disabled={isLoading}
              required
            >
              <option value="" className="text-white bg-gray-900">Choose sport...</option>
              {SPORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value} className="text-white bg-gray-900">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Gym Category (only if Gym selected) */}
          {formData.sport === 'gym' && (
            <div>
              <label className="block mb-2 text-sm font-medium text-white sm:text-base">
                Body Area
              </label>
              <select
                value={formData.category || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as StreakInsert['category'] }))}
                className="w-full p-3 text-white placeholder-gray-300 transition-all duration-200 border sm:p-4 border-white/20 rounded-2xl bg-white/10 backdrop-blur-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
                disabled={isLoading}
              >
                <option value="" className="text-white bg-gray-900">Choose body area...</option>
                {GYM_CATEGORIES.map(option => (
                  <option key={option.value} value={option.value} className="text-white bg-gray-900">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Mood Selection */}
          <div>
            <label className="block mb-2 text-sm font-medium text-white sm:text-base">
              How are you feeling? *
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {MOOD_OPTIONS.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, mood: option.value }))}
                  className={`p-3 sm:p-4 rounded-2xl border-2 text-center transition-all duration-200 backdrop-blur-sm ${
                    formData.mood === option.value
                      ? 'border-orange-500/70 bg-orange-500/20 text-white shadow-lg shadow-orange-500/30'
                      : 'border-white/20 bg-white/10 text-white hover:border-white/40 hover:bg-white/20'
                  }`}
                  disabled={isLoading}
                >
                  <div className="mb-1 text-xl sm:text-2xl">{option.emoji}</div>
                  <div className="text-xs font-medium sm:text-sm">{option.value.charAt(0).toUpperCase() + option.value.slice(1)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 font-medium text-white transition-all duration-200 border sm:py-4 bg-white/10 backdrop-blur-sm border-white/20 rounded-2xl hover:bg-white/20"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 font-semibold text-white transition-all duration-200 transform sm:py-4 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 rounded-2xl hover:shadow-lg hover:shadow-orange-500/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={isLoading || !formData.sport || !formData.mood}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                'Save Workout'
              )}
            </button>
          </div>
        </form>
    </div>
  );
};

export default StreakForm;
