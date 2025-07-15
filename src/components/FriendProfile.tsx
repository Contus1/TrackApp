import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { Streak, FriendWithStreak } from '../types/streaks';
import TimelineGraph from './TimelineGraph';
import { notificationService } from '../services/notificationService';

interface FriendProfileProps {
  friend: FriendWithStreak;
  onBack: () => void;
  onRemoveFriend: (friendId: string) => Promise<void>;
}

const FriendProfile: React.FC<FriendProfileProps> = ({ friend, onBack, onRemoveFriend }) => {
  const [friendStreaks, setFriendStreaks] = useState<Streak[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsMotivation, setNeedsMotivation] = useState(false);
  const [sendingMotivation, setSendingMotivation] = useState(false);
  const [motivationMessage, setMotivationMessage] = useState('');
  const [showCustomMessage, setShowCustomMessage] = useState(false);

  const loadFriendStreaks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get last 30 days of friend's streaks
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', friend.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) {
        throw new Error('Error loading friend data');
      }

      setFriendStreaks(data || []);
    } catch (err) {
      console.error('Error loading friend streaks:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [friend.id]);

  const checkIfFriendNeedsMotivation = useCallback(async () => {
    try {
      const needsMotivation = await notificationService.checkFriendNeedsMotivation(friend.id);
      setNeedsMotivation(needsMotivation);
    } catch (err) {
      console.error('Error checking if friend needs motivation:', err);
      // Don't show error to user, just disable motivation feature
      setNeedsMotivation(false);
    }
  }, [friend.id]);

  useEffect(() => {
    loadFriendStreaks();
    checkIfFriendNeedsMotivation();
  }, [friend.id, loadFriendStreaks, checkIfFriendNeedsMotivation]);

  const handleSendMotivation = async () => {
    if (sendingMotivation) return;

    try {
      setSendingMotivation(true);
      await notificationService.sendMotivationNotification(
        friend.id,
        motivationMessage || undefined
      );
      setShowCustomMessage(false);
      setMotivationMessage('');
      // Recheck motivation status
      await checkIfFriendNeedsMotivation();
    } catch (err) {
      console.error('Error sending motivation:', err);
      setError(err instanceof Error ? err.message : 'Failed to send motivation');
    } finally {
      setSendingMotivation(false);
    }
  };

  // Berechne aktuelle Streak des Freundes
  const calculateCurrentStreak = (streaks: Streak[]) => {
    if (streaks.length === 0) return 0;
    
    const sortedStreaks = [...streaks].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let currentStreak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedStreaks.length; i++) {
      const streakDate = new Date(sortedStreaks[i].date);
      const diffDays = Math.floor((today.getTime() - streakDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === i) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return currentStreak;
  };

  // Berechne die beste Streak
  const calculateBestStreak = (streaks: Streak[]) => {
    if (streaks.length === 0) return 0;
    
    const sortedStreaks = [...streaks].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let bestStreak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;
    
    for (const streak of sortedStreaks) {
      const currentDate = new Date(streak.date);
      
      if (lastDate && Math.abs(currentDate.getTime() - lastDate.getTime()) <= 24 * 60 * 60 * 1000) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
      
      bestStreak = Math.max(bestStreak, currentStreak);
      lastDate = currentDate;
    }
    
    return bestStreak;
  };

  const currentStreak = calculateCurrentStreak(friendStreaks);
  const bestStreak = calculateBestStreak(friendStreaks);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Floating orbs background */}
      <div className="absolute inset-0">
        <div className="absolute rounded-full top-20 left-10 w-72 h-72 bg-gradient-to-r from-orange-400 to-rose-400 mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute rounded-full top-40 right-10 w-96 h-96 bg-gradient-to-r from-yellow-400 to-orange-400 mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute rounded-full -bottom-8 left-20 w-80 h-80 bg-gradient-to-r from-rose-400 to-pink-400 mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Additional CSS for blob animation */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-xl border-b border-white/20 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors backdrop-blur-sm border border-white/20"
          >
            ←
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
              {(friend.display_name || friend.email || 'F')[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">
                {friend.display_name || friend.email?.split('@')[0] || 'Friend'}
              </h1>
              <p className="text-sm text-gray-300">
                Friend since {new Date(friend.created_at).toLocaleDateString('en-US')}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => onRemoveFriend(friend.id)}
            className="w-10 h-10 rounded-2xl bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-400 transition-colors backdrop-blur-sm border border-red-500/30"
            title="Remove friend"
          >
            🗑️
          </button>
        </div>
      </header>

      <main className="relative z-10 pb-20">
        <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* Streak Stats */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/20">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 mb-4 shadow-lg">
                <span className="text-xl sm:text-2xl">🔥</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                {currentStreak} Days
              </h2>
              <p className="text-gray-300">
                Current streak by {friend.display_name || friend.email?.split('@')[0] || 'Friend'}
              </p>
            </div>
          </div>

          {/* Friend Timeline */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/20">
            {loading ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Activity</h3>
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-400 text-4xl mb-4">😕</div>
                <p className="text-gray-300">{error}</p>
                <button
                  onClick={loadFriendStreaks}
                  className="mt-4 px-4 py-2 bg-orange-500/80 backdrop-blur-sm text-white rounded-2xl hover:bg-orange-600/80 transition-colors border border-orange-400/30"
                >
                  Try again
                </button>
              </div>
            ) : (
              <TimelineGraph
                streaks={friendStreaks}
                isLoading={loading}
                // No delete function for friend streaks
              />
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {friendStreaks.length}
              </div>
              <div className="text-sm text-white/70">
                Workouts (30 days)
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {bestStreak}
              </div>
              <div className="text-sm text-white/70">
                Best Streak
              </div>
            </div>
          </div>

          {/* Motivation Card */}
          <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-3xl p-6 border border-orange-200">
            <div className="text-center">
              <div className="text-2xl mb-3">💪</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Motivate {friend.display_name || friend.email?.split('@')[0] || 'your friend'}!
              </h3>
              
              {needsMotivation ? (
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm mb-4">
                    {friend.display_name || friend.email?.split('@')[0] || 'Your friend'} hasn't been training recently. Send them a motivational push notification!
                  </p>
                  
                  {!showCustomMessage ? (
                    <div className="space-y-3">
                      <button
                        onClick={handleSendMotivation}
                        disabled={sendingMotivation}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 px-6 rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50"
                      >
                        {sendingMotivation ? (
                          <span className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Sending...
                          </span>
                        ) : (
                          '🚀 Send Quick Motivation'
                        )}
                      </button>
                      
                      <button
                        onClick={() => setShowCustomMessage(true)}
                        className="w-full bg-white/10 backdrop-blur-xl text-white font-medium py-3 px-4 rounded-2xl hover:bg-white/20 transition-colors border border-white/20 shadow-lg min-h-[48px]"
                      >
                        ✏️ Write Custom Message
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <textarea
                        value={motivationMessage}
                        onChange={(e) => setMotivationMessage(e.target.value)}
                        placeholder="Write your motivational message..."
                        className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        rows={3}
                      />
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={handleSendMotivation}
                          disabled={sendingMotivation}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 px-6 rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50"
                        >
                          {sendingMotivation ? (
                            <span className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Sending...
                            </span>
                          ) : (
                            '📨 Send Message'
                          )}
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowCustomMessage(false);
                            setMotivationMessage('');
                          }}
                          className="bg-gray-200 text-gray-600 font-medium py-3 px-6 rounded-2xl hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 text-sm mb-4">
                    {friend.display_name || friend.email?.split('@')[0] || 'Your friend'} has been active recently! Keep up the great work together! 🚀
                  </p>
                  <div className="text-xs text-gray-500">
                    You can send motivational messages when your friend hasn't trained for 2+ days
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Remove Friend Section */}
          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-200">
            <div className="text-center">
              <div className="text-2xl mb-3">⚠️</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Remove Friend
              </h3>
              <p className="text-white/80 text-sm mb-4">
                If you remove {friend.display_name || friend.email?.split('@')[0] || 'this friend'}, they will no longer appear in your friends list and you won't be able to see their activity.
              </p>
              
              <button
                onClick={() => onRemoveFriend(friend.id)}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200"
              >
                🗑️ Remove Friend
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FriendProfile;
