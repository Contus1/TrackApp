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
      <div className="p-4 border shadow-xl bg-white/10 backdrop-blur-xl rounded-2xl sm:p-5 border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1 min-w-0 space-x-3">
            <div className="flex items-center justify-center w-10 h-10 shadow-lg sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl">
              <span className="text-lg text-white sm:text-xl">🤖</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="mb-1 text-sm font-bold text-white sm:text-base">AI Training Coach</h4>
              <p className="text-xs leading-relaxed text-gray-300 sm:text-sm">Start training to unlock personalized insights and recommendations!</p>
            </div>
          </div>
          <button
            onClick={onOpenFullAnalysis}
            className="flex-shrink-0 px-3 py-2 ml-3 text-xs font-semibold text-white transition-all duration-200 border shadow-sm bg-white/20 backdrop-blur-sm hover:bg-white/30 hover:text-gray-100 sm:text-sm sm:px-4 sm:py-2 rounded-2xl hover:shadow-md border-white/30"
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
    <div className="p-3 border shadow-xl bg-white/10 backdrop-blur-xl rounded-2xl sm:p-4 border-white/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1 min-w-0 space-x-2 sm:space-x-3">
          <div className="flex items-center justify-center flex-shrink-0 shadow-lg w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl">
            <span className="text-sm text-white sm:text-lg">🤖</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-1 space-x-1 sm:space-x-2">
              <h4 className="text-xs font-bold text-white truncate sm:text-sm">AI Coach</h4>
              <span className="flex-shrink-0 text-sm sm:text-lg">{insight.emoji}</span>
              <div className="flex items-center flex-shrink-0 space-x-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                <span className="text-xs font-bold text-indigo-300 sm:text-sm">
                  {feedback.overallScore}/100
                </span>
              </div>
            </div>
            <p className={`text-xs sm:text-sm ${insight.color.replace('text-', 'text-').replace('-600', '-300')} font-semibold line-clamp-2 leading-tight`}>
              {insight.text}
            </p>
          </div>
        </div>
        <button
          onClick={onOpenFullAnalysis}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white hover:text-gray-100 text-xs sm:text-sm font-bold px-2 py-1.5 sm:px-3 sm:py-2 rounded-2xl transition-all duration-200 flex-shrink-0 ml-2 shadow-sm hover:shadow-md border border-white/30 transform hover:scale-105 active:scale-95"
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
