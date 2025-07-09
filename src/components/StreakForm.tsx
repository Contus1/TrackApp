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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add Workout</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sport Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sport Type *
            </label>
            <select
              value={formData.sport}
              onChange={(e) => handleSportChange(e.target.value as StreakInsert['sport'])}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={isLoading}
              required
            >
              <option value="">Choose sport...</option>
              {SPORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Gym Category (only if Gym selected) */}
          {formData.sport === 'gym' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Body Area
              </label>
              <select
                value={formData.category || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as StreakInsert['category'] }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                disabled={isLoading}
              >
                <option value="">Choose body area...</option>
                {GYM_CATEGORIES.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Mood Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How are you feeling? *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {MOOD_OPTIONS.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, mood: option.value }))}
                  className={`p-3 rounded-lg border-2 text-center transition-colors ${
                    formData.mood === option.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={isLoading}
                >
                  <div className="text-2xl mb-1">{option.emoji}</div>
                  <div className="text-sm font-medium">{option.value.charAt(0).toUpperCase() + option.value.slice(1)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors font-medium"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
              disabled={isLoading || !formData.sport || !formData.mood}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StreakForm;
