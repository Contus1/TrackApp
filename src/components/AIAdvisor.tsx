import React, { useState, useEffect, useCallback } from 'react';
import { trainingAI, type AIFeedback } from '../services/trainingAI';
import type { Streak } from '../types/streaks';

interface AIAdvisorProps {
  streaks: Streak[];
  isVisible: boolean;
  onClose: () => void;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ streaks, isVisible, onClose }) => {
  const [feedback, setFeedback] = useState<AIFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateFeedback = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate AI processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const analysis = trainingAI.analyzeTrainingData(streaks);
      const aiFeedback = trainingAI.generateFeedback(analysis);
      setFeedback(aiFeedback);
    } catch (error) {
      console.error('Error generating AI feedback:', error);
    } finally {
      setIsLoading(false);
    }
  }, [streaks]);

  useEffect(() => {
    if (isVisible && streaks.length > 0) {
      generateFeedback();
    }
  }, [isVisible, streaks.length, generateFeedback]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg sm:w-full h-[90vh] sm:h-auto sm:max-h-[95vh] overflow-hidden shadow-2xl border-t border-gray-100 sm:border">
        {/* Header with improved gradient */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white rounded-t-3xl sticky top-0 z-10 shadow-lg">
          <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 sm:w-14 sm:h-14 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white border-opacity-30">
                  <span className="text-xl sm:text-2xl">🤖</span>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight">AI Training Coach</h2>
                  <p className="text-indigo-100 text-xs sm:text-sm font-medium">Your personal fitness advisor</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-11 h-11 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-white hover:bg-opacity-30 transition-all duration-200 text-xl leading-none backdrop-blur-sm border border-white border-opacity-20"
                aria-label="Close AI Coach"
              >
                ✕
              </button>
            </div>
          </div>
          
          {/* Professional progress indicator */}
          <div className="px-4 sm:px-6 pb-4">
            <div className="w-full bg-white bg-opacity-20 rounded-full h-1">
              <div 
                className="bg-white h-1 rounded-full transition-all duration-1000"
                style={{ width: isLoading ? '30%' : '100%' }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content with improved scrolling */}
        <div className="flex-1 overflow-y-auto touch-scroll p-4 sm:p-6 bg-gradient-to-b from-gray-50 to-white">
          {isLoading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mb-6 shadow-inner">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-3 border-indigo-300 border-t-indigo-600"></div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Analyzing Your Training</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">Processing your workout data and mood patterns to provide personalized insights</p>
              <div className="mt-6 flex justify-center space-x-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          ) : feedback ? (
            <div className="space-y-6 sm:space-y-8">
              {/* Overall Score - Enhanced */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-3xl mb-6 shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-white opacity-20 rounded-3xl"></div>
                  <span className="text-3xl sm:text-4xl relative z-10">{feedback.emoji}</span>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 tracking-tight">{feedback.title}</h3>
                
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {feedback.overallScore}
                  </span>
                  <span className="text-gray-400 text-lg font-medium">/100</span>
                </div>
                
                {/* Enhanced scoring explanation */}
                <div className="text-xs sm:text-sm text-gray-600 mb-6 bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                  <div className="font-semibold text-gray-800 mb-2">Score Breakdown:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>Frequency:</span>
                      <span className="font-medium">40pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mood:</span>
                      <span className="font-medium">30pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Variety:</span>
                      <span className="font-medium">20pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Consistency:</span>
                      <span className="font-medium">10pts</span>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-3 sm:h-4 mb-6 overflow-hidden shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 h-3 sm:h-4 rounded-full transition-all duration-1500 ease-out shadow-sm"
                    style={{ width: `${feedback.overallScore}%` }}
                  ></div>
                </div>
                
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed font-medium">{feedback.message}</p>
              </div>

              {/* Enhanced Recommendations */}
              {feedback.recommendations.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center text-base sm:text-lg">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-sm">💡</span>
                    </div>
                    Personalized Recommendations
                  </h4>
                  <ul className="space-y-3">
                    {feedback.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm sm:text-base text-gray-700 flex items-start bg-white rounded-lg p-3 shadow-sm border border-blue-100">
                        <span className="text-blue-500 mr-3 mt-0.5 font-bold">•</span>
                        <span className="leading-relaxed">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Enhanced Next Goal */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-5 border border-orange-100 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center text-base sm:text-lg">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm">🎯</span>
                  </div>
                  Your Next Challenge
                </h4>
                <div className="bg-white rounded-lg p-4 border border-orange-100 shadow-sm">
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed font-medium">{feedback.nextGoal}</p>
                </div>
              </div>

              {/* Enhanced Motivational Tip */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center text-base sm:text-lg">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm">⚡</span>
                  </div>
                  Daily Motivation
                </h4>
                <div className="bg-white rounded-lg p-4 border border-green-100 shadow-sm">
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed italic font-medium">"{feedback.motivationalTip}"</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-gray-400 text-3xl">🤖</span>
              </div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">No Training Data</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Start logging your workouts to receive personalized AI insights and recommendations!</p>
            </div>
          )}
        </div>

        {/* Enhanced Footer */}
        <div className="bg-white border-t border-gray-100 sticky bottom-0 shadow-lg">
          <div className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
              <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Analysis based on last 30 days
              </div>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 sm:px-5 sm:py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm sm:text-base font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 mobile-btn"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>Got it!</span>
                  <span className="text-lg">💪</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;
