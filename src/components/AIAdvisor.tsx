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
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-black bg-opacity-60 sm:items-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white/10 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg sm:w-full max-h-[95vh] flex flex-col shadow-2xl border-t border-white/20 sm:border">
        {/* Header with glassmorphism gradient */}
        <div className="flex-shrink-0 text-white border-b shadow-lg bg-gradient-to-br from-indigo-600/90 via-purple-600/90 to-blue-700/90 backdrop-blur-xl rounded-t-3xl border-white/10">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center border shadow-xl bg-white/20 border-white/30 w-11 h-11 sm:w-14 sm:h-14 rounded-2xl backdrop-blur-sm">
                  <span className="text-xl sm:text-2xl">🤖</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight sm:text-xl">AI Tracki Coach</h2>
                  <p className="text-xs font-medium text-blue-200 sm:text-sm">Your personal fitness advisor</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex items-center justify-center text-xl leading-none text-white transition-all duration-200 transform border shadow-xl bg-white/20 border-white/30 w-11 h-11 rounded-xl hover:bg-white/30 backdrop-blur-sm hover:scale-110"
                aria-label="Close AI Coach"
              >
                ✕
              </button>
            </div>
          </div>
          
          {/* Professional progress indicator */}
          <div className="px-4 pb-4 sm:px-6">
            <div className="w-full h-1 rounded-full bg-white/20">
              <div 
                className="h-1 transition-all duration-1000 bg-white rounded-full shadow-lg"
                style={{ width: isLoading ? '30%' : '100%' }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content with dark glassmorphism theme */}
        <div className="flex-1 min-h-0 p-4 overflow-y-auto touch-scroll sm:p-6 bg-gradient-to-b from-slate-900/95 via-purple-900/95 to-slate-900/95">
          {isLoading ? (
            <div className="py-8 text-center sm:py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 border shadow-xl sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl backdrop-blur-xl border-white/10">
                <div className="w-8 h-8 rounded-full border-indigo-400/50 animate-spin sm:h-10 sm:w-10 border-3 border-t-indigo-400"></div>
              </div>
              <h3 className="mb-3 text-lg font-bold text-white sm:text-xl">Analyzing Your Training</h3>
              <p className="text-sm leading-relaxed text-white/80 sm:text-base">Processing your workout data and mood patterns to provide personalized insights</p>
              <div className="flex justify-center mt-6 space-x-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          ) : feedback ? (
            <div className="space-y-6 sm:space-y-8">
              {/* Overall Score - Enhanced with dark theme */}
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6 overflow-hidden border shadow-xl sm:w-24 sm:h-24 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-3xl border-white/20">
                  <div className="absolute inset-0 bg-white/10 rounded-3xl backdrop-blur-sm"></div>
                  <span className="relative z-10 text-3xl sm:text-4xl">{feedback.emoji}</span>
                </div>
                
                <h3 className="mb-3 text-xl font-bold tracking-tight text-white sm:text-2xl">{feedback.title}</h3>
                
                <div className="flex items-center justify-center mb-4 space-x-3">
                  <span className="text-3xl font-bold text-transparent sm:text-4xl bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text">
                    {feedback.overallScore}
                  </span>
                  <span className="text-lg font-medium text-white/60">/100</span>
                </div>
                
                {/* Enhanced scoring explanation with dark theme */}
                <div className="p-4 mb-6 text-xs border shadow-xl text-white/80 bg-white/10 backdrop-blur-xl border-white/20 sm:text-sm rounded-2xl">
                  <div className="mb-3 font-semibold text-white">Score Breakdown:</div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex justify-between p-2 rounded-lg bg-white/5">
                      <span>Frequency:</span>
                      <span className="font-medium text-indigo-300">40pts</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-white/5">
                      <span>Mood:</span>
                      <span className="font-medium text-purple-300">30pts</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-white/5">
                      <span>Variety:</span>
                      <span className="font-medium text-blue-300">20pts</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-white/5">
                      <span>Consistency:</span>
                      <span className="font-medium text-green-300">10pts</span>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced progress bar with glassmorphism */}
                <div className="w-full h-3 mb-6 overflow-hidden border rounded-full shadow-inner bg-white/10 backdrop-blur-xl sm:h-4 border-white/20">
                  <div 
                    className="h-3 transition-all ease-out rounded-full shadow-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 sm:h-4 duration-1500"
                    style={{ width: `${feedback.overallScore}%` }}
                  ></div>
                </div>
                
                <p className="text-sm font-medium leading-relaxed text-white/90 sm:text-base">{feedback.message}</p>
              </div>

              {/* Enhanced Recommendations with glassmorphism */}
              {feedback.recommendations.length > 0 && (
                <div className="p-5 border shadow-xl border-blue-400/30 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-3xl backdrop-blur-xl">
                  <h4 className="flex items-center mb-4 text-base font-bold text-white sm:text-lg">
                    <div className="flex items-center justify-center w-10 h-10 mr-3 shadow-lg rounded-xl bg-gradient-to-r from-blue-400 to-indigo-500">
                      <span className="text-lg text-white">💡</span>
                    </div>
                    Personalized Recommendations
                  </h4>
                  <ul className="space-y-3">
                    {feedback.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start p-4 text-sm transition-all duration-200 border shadow-lg text-white/90 bg-white/10 border-white/20 rounded-2xl backdrop-blur-xl sm:text-base hover:bg-white/15">
                        <span className="text-blue-400 mr-3 mt-0.5 font-bold text-lg">•</span>
                        <span className="leading-relaxed">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Enhanced Next Goal with glassmorphism */}
              <div className="p-5 border shadow-xl border-orange-400/30 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-3xl backdrop-blur-xl">
                <h4 className="flex items-center mb-4 text-base font-bold text-white sm:text-lg">
                  <div className="flex items-center justify-center w-10 h-10 mr-3 shadow-lg rounded-xl bg-gradient-to-r from-orange-400 to-red-500">
                    <span className="text-lg text-white">🎯</span>
                  </div>
                  Your Next Challenge
                </h4>
                <div className="p-4 border shadow-lg bg-white/10 border-white/20 rounded-2xl backdrop-blur-xl">
                  <p className="text-sm font-medium leading-relaxed text-white/90 sm:text-base">{feedback.nextGoal}</p>
                </div>
              </div>

              {/* Enhanced Motivational Tip with glassmorphism */}
              <div className="p-5 border shadow-xl border-green-400/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl backdrop-blur-xl">
                <h4 className="flex items-center mb-4 text-base font-bold text-white sm:text-lg">
                  <div className="flex items-center justify-center w-10 h-10 mr-3 shadow-lg rounded-xl bg-gradient-to-r from-green-400 to-emerald-500">
                    <span className="text-lg text-white">⚡</span>
                  </div>
                  Daily Motivation
                </h4>
                <div className="p-4 border shadow-lg bg-white/10 border-white/20 rounded-2xl backdrop-blur-xl">
                  <p className="text-sm italic font-medium leading-relaxed text-white/90 sm:text-base">"{feedback.motivationalTip}"</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 border shadow-xl bg-white/10 backdrop-blur-xl rounded-3xl border-white/20">
                <span className="text-3xl text-white/60">🤖</span>
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">No Training Data</h3>
              <p className="text-sm leading-relaxed text-white/70">Start logging your workouts to receive personalized AI insights and recommendations!</p>
            </div>
          )}
        </div>

        {/* Enhanced Footer with glassmorphism */}
        <div className="flex-shrink-0 border-t shadow-lg bg-white/10 backdrop-blur-xl border-white/20">
          <div className="p-4 sm:p-5">
            <div className="flex flex-col items-center justify-between space-y-3 sm:flex-row sm:space-y-0">
              <div className="flex items-center text-xs text-center text-white/70 sm:text-sm sm:text-left">
                <div className="w-2 h-2 mr-2 bg-green-400 rounded-full animate-pulse"></div>
                Analysis based on last 30 days
              </div>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 sm:px-5 sm:py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl text-sm sm:text-base font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 mobile-btn border border-white/20 backdrop-blur-xl min-h-[48px]"
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
