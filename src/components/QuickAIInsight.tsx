import React from 'react';
import type { Streak } from '../types/streaks';
import { trainingAI } from '../services/trainingAI';

interface QuickAIInsightProps {
  streaks: Streak[];
  onOpenFullAnalysis: () => void;
}

const QuickAIInsight: React.FC<QuickAIInsightProps> = ({ streaks, onOpenFullAnalysis }) => {
  if (streaks.length === 0) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 rounded-2xl p-4 sm:p-5 border border-indigo-100 shadow-sm mobile-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-lg sm:text-xl">🤖</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-1">AI Training Coach</h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Start training to unlock personalized insights and recommendations!</p>
            </div>
          </div>
          <button
            onClick={onOpenFullAnalysis}
            className="bg-white bg-opacity-90 hover:bg-opacity-100 text-indigo-600 hover:text-indigo-700 text-xs sm:text-sm font-semibold px-3 py-2 sm:px-4 sm:py-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md border border-indigo-200 flex-shrink-0 ml-3"
          >
            Learn More →
          </button>
        </div>
      </div>
    );
  }

  // Quick analysis for the insight card
  const analysis = trainingAI.analyzeTrainingData(streaks);
  const feedback = trainingAI.generateFeedback(analysis);

  // Get a quick insight based on recent performance
  const getQuickInsight = () => {
    const { weeklyFrequency, moodPattern, recentPerformance } = analysis;
    
    if (recentPerformance.lastWeekWorkouts === 0) {
      return {
        text: "Time to get back on track! Your body is ready for a great comeback.",
        emoji: "💪",
        color: "text-orange-600"
      };
    }
    
    if (weeklyFrequency >= 4) {
      return {
        text: "Amazing consistency! You're building incredible momentum.",
        emoji: "🔥",
        color: "text-green-600"
      };
    }
    
    if (moodPattern.gut > moodPattern.schlecht) {
      return {
        text: "Great mood trends! Your positive energy is showing in your workouts.",
        emoji: "😊",
        color: "text-blue-600"
      };
    }
    
    return {
      text: "Keep building your routine. Small steps lead to big victories!",
      emoji: "🌟",
      color: "text-purple-600"
    };
  };

  const insight = getQuickInsight();

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 rounded-2xl p-3 sm:p-4 border border-indigo-100 shadow-sm mobile-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-white text-sm sm:text-lg">🤖</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
              <h4 className="font-bold text-gray-900 text-xs sm:text-sm truncate">AI Coach</h4>
              <span className="text-sm sm:text-lg flex-shrink-0">{insight.emoji}</span>
              <div className="flex items-center space-x-1 flex-shrink-0">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                <span className="text-xs sm:text-sm font-bold text-indigo-600">
                  {feedback.overallScore}/100
                </span>
              </div>
            </div>
            <p className={`text-xs sm:text-sm ${insight.color} font-semibold line-clamp-2 leading-tight`}>
              {insight.text}
            </p>
          </div>
        </div>
        <button
          onClick={onOpenFullAnalysis}
          className="bg-white bg-opacity-90 hover:bg-opacity-100 text-indigo-600 hover:text-indigo-700 text-xs sm:text-sm font-bold px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl transition-all duration-200 flex-shrink-0 ml-2 shadow-sm hover:shadow-md border border-indigo-200 transform hover:scale-105 active:scale-95"
        >
          <span className="hidden sm:inline">Full Analysis</span>
          <span className="sm:hidden">Full</span>
          <span className="ml-1">→</span>
        </button>
      </div>
    </div>
  );
};

export default QuickAIInsight;
