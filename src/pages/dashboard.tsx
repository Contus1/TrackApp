import React, { useState, useEffect, useCallback } from 'react';
import { streakService, streakSubscriptions } from '../services/streakService';
import { friendsService } from '../services/friendsService';
import { supabase } from '../services/supabase';
import type { User } from '@supabase/supabase-js';
import type { Streak, FriendWithStreak, StreakInsert } from '../types/streaks';
import DashboardHeader from '../components/DashboardHeader';
import Footer from '../components/Footer';
import StreakForm from '../components/StreakForm';
import StreakDisplay from '../components/StreakDisplay';
import FriendsBar from '../components/FriendsBar';
import TimelineGraph from '../components/TimelineGraph';
import FriendProfile from '../components/FriendProfile';
import AIAdvisor from '../components/AIAdvisor';
import QuickAIInsight from '../components/QuickAIInsight';
import ProfilePage from './profile';
import NotificationSetup from '../components/NotificationSetup';
import NotificationList from '../components/NotificationList';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import SimpleFriends from '../components/SimpleFriends';

interface DashboardPageProps {
  onLogout: () => void;
  user?: User | null;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout, user }) => {
  // State Management
  const [currentStreak, setCurrentStreak] = useState(0);
  const [recentStreaks, setRecentStreaks] = useState<Streak[]>([]);
  const [friends, setFriends] = useState<FriendWithStreak[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<FriendWithStreak | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showAIAdvisor, setShowAIAdvisor] = useState(false);
  const [loading, setLoading] = useState({
    streak: true,
    timeline: true,
    friends: true,
    form: false
  });
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  const loadStreakData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(prev => ({ ...prev, streak: true }));
      const { data, error } = await streakService.getCurrentStreak(user.id);
      
      if (error) {
        console.error('Error loading streak:', error);
      } else {
        setCurrentStreak(data || 0);
      }
    } catch (err) {
      console.error('Streak loading failed:', err);
    } finally {
      setLoading(prev => ({ ...prev, streak: false }));
    }
  }, [user?.id]);

  const loadTimelineData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(prev => ({ ...prev, timeline: true }));
      const { data, error } = await streakService.getRecentStreaks(user.id, 10);
      
      if (error) {
        console.error('Error loading timeline:', error);
      } else {
        setRecentStreaks(data || []);
      }
    } catch (err) {
      console.error('Timeline loading failed:', err);
    } finally {
      setLoading(prev => ({ ...prev, timeline: false }));
    }
  }, [user?.id]);

  const loadFriendsData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(prev => ({ ...prev, friends: true }));
      
      // Use the friends_simple view for basic friend data
      const { data: friendsData, error } = await supabase
        .from('friends_simple')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error loading friends:', error);
        setFriends([]);
      } else {
        // Get current streaks for all friends
        const friendsWithStreaks: FriendWithStreak[] = [];
        
        for (const friend of friendsData || []) {
          // Get the actual current streak for this friend
          const { data: streakData } = await supabase
            .from('user_current_streaks')
            .select('current_streak')
            .eq('user_id', friend.friend_id)
            .single();
          
          friendsWithStreaks.push({
            id: friend.friend_id || '',
            display_name: friend.friend_name || `Friend ${friend.friend_code}` || 'Friend',
            email: '', // Not available in friends_simple view
            avatar_url: friend.friend_avatar || undefined,
            current_streak: streakData?.current_streak || 0,
            friendship_status: 'accepted' as const,
            created_at: friend.friendship_created
          });
        }
        
        setFriends(friendsWithStreaks);
      }
    } catch (err) {
      console.error('Friends loading failed:', err);
      setFriends([]);
    } finally {
      setLoading(prev => ({ ...prev, friends: false }));
    }
  }, [user?.id]);

  // Effects
  useEffect(() => {
    if (!user?.id) return;

    loadStreakData();
    loadTimelineData();
    loadFriendsData();

    // Setup real-time subscriptions
    const streakSubscription = streakSubscriptions.subscribeToUserStreaks(
      user.id,
      () => {
        loadStreakData();
        loadTimelineData();
      }
    );

    const friendshipSubscription = streakSubscriptions.subscribeToUserFriendships(
      user.id,
      () => {
        loadFriendsData();
      }
    );

    // Cleanup subscriptions
    return () => {
      streakSubscription.unsubscribe();
      friendshipSubscription.unsubscribe();
    };
  }, [user?.id, loadStreakData, loadTimelineData, loadFriendsData]);

  // Event Handlers
  const handleAddStreak = async (streakData: StreakInsert) => {
    try {
      setLoading(prev => ({ ...prev, form: true }));
      setError(null);

      console.log('Sending streak data:', streakData);
      const { data, error } = await streakService.createStreak(streakData);
      
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Error saving workout: ${error.message}`);
      }

      console.log('Streak created successfully:', data);
      setShowForm(false);
      // Data will be updated via real-time subscription
    } catch (err) {
      console.error('Error creating streak:', err);
      setError(err instanceof Error ? err.message : 'Error saving');
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  const handleDeleteStreak = async (streakId: string) => {
    if (!window.confirm('Really delete this workout entry?')) return;

    try {
      const { error } = await streakService.deleteStreak(streakId);
      
      if (error) {
        throw new Error('Error deleting workout');
      }

      // Data will be updated via real-time subscription
    } catch (err) {
      console.error('Error deleting streak:', err);
      setError(err instanceof Error ? err.message : 'Error deleting');
    }
  };

  const handleDeleteStreakByObject = async (streak: Streak) => {
    await handleDeleteStreak(streak.id);
  };

  const handleFriendClick = (friend: FriendWithStreak) => {
    setSelectedFriend(friend);
  };

  const handleBackFromFriend = () => {
    setSelectedFriend(null);
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!user?.id) return;
    
    const friend = selectedFriend || friends.find(f => f.id === friendId);
    const friendName = friend?.display_name || friend?.email?.split('@')[0] || 'this friend';
    
    if (!window.confirm(`Are you sure you want to remove ${friendName} from your friends list?`)) {
      return;
    }

    try {
      setError(null);
      console.log('Removing friend from database:', friendId);
      
      const { error } = await friendsService.removeFriend(user.id, friendId);
      
      if (error) {
        console.error('Database removal failed:', error);
        throw new Error(`Failed to remove friend: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      console.log('Friend removed from database successfully');
      
      // Reload friends list from database to ensure consistency
      await loadFriendsData();
      
      // Go back to main dashboard if we were viewing the removed friend's profile
      if (selectedFriend?.id === friendId) {
        setSelectedFriend(null);
      }
      
      console.log('Friend removed successfully and friends list refreshed');
    } catch (err) {
      console.error('Error removing friend:', err);
      setError(err instanceof Error ? err.message : 'Error removing friend');
    }
  };

  const handleProfileClick = () => {
    setShowProfile(true);
  };

  const handleBackFromProfile = () => {
    setShowProfile(false);
  };

  const handleInviteFriend = () => {
    setShowInvite(true);
  };

  const handleShowAIAdvisor = () => {
    setShowAIAdvisor(true);
  };

  const handleCloseAIAdvisor = () => {
    setShowAIAdvisor(false);
  };

  // Loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500">
            <span className="text-2xl">🔥</span>
          </div>
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Not logged in
          </h2>
          <p className="mb-6 text-gray-600">
            Please log in to track your workouts.
          </p>
          <button
            onClick={onLogout}
            className="px-6 py-3 font-semibold text-white transition-all duration-200 transform shadow-lg bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 rounded-2xl hover:shadow-xl hover:scale-105"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Show Profile if selected
  if (showProfile && user) {
    return (
      <ProfilePage 
        user={user} 
        onBack={handleBackFromProfile}
        onLogout={onLogout}
      />
    );
  }

  // Show Friend Profile if selected
  if (selectedFriend && user) {
    return (
      <FriendProfile 
        friend={selectedFriend} 
        onBack={handleBackFromFriend}
        onRemoveFriend={handleRemoveFriend}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <DashboardHeader user={user} onLogout={onLogout} onProfileClick={handleProfileClick} />
      
      <main className="pb-20 safe-bottom">
        <div className="space-y-6 mobile-container sm:space-y-8">
          {/* Floating Action Buttons - Mobile First */}
          <div className="flex items-center justify-center pt-4 space-x-4 sm:space-x-6">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center w-16 h-16 text-2xl font-bold text-white transition-all duration-200 transform shadow-xl sm:w-18 sm:h-18 bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 hover:from-orange-600 hover:via-red-600 hover:to-pink-700 rounded-2xl sm:text-3xl hover:shadow-2xl hover:scale-110 active:scale-95 mobile-btn"
              aria-label="Add workout"
            >
              +
            </button>
            
            <button
              onClick={handleShowAIAdvisor}
              className="flex items-center justify-center text-xl text-white transition-all duration-200 transform shadow-xl w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 hover:from-indigo-600 hover:via-purple-600 hover:to-blue-700 rounded-2xl sm:text-2xl hover:shadow-2xl hover:scale-110 active:scale-95"
              title="AI Training Coach"
              aria-label="Open AI Coach"
            >
              🤖
            </button>
          </div>

          {/* Current Streak Display - Enhanced */}
          <div className="p-1 shadow-xl glass rounded-3xl">
            <StreakDisplay 
              currentStreak={currentStreak} 
              isLoading={loading.streak} 
            />
          </div>

          {/* AI Quick Insight - Enhanced */}
          <QuickAIInsight 
            streaks={recentStreaks}
            onOpenFullAnalysis={handleShowAIAdvisor}
          />

          {/* Friends Section - Enhanced */}
          <div className="p-4 bg-white border border-gray-100 shadow-lg rounded-3xl sm:p-6 mobile-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 sm:text-xl">Training Partners</h3>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <FriendsBar
              friends={friends}
              isLoading={loading.friends}
              onFriendClick={handleFriendClick}
              onManageFriends={handleInviteFriend}
            />
          </div>

          {/* Timeline Graph - Enhanced */}
          <div className="p-4 bg-white border border-gray-100 shadow-lg rounded-3xl sm:p-6 mobile-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 sm:text-xl">Your Progress</h3>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-xs text-gray-500">Last 30 days</span>
              </div>
            </div>
            <TimelineGraph
              streaks={recentStreaks}
              isLoading={loading.timeline}
              onDeleteStreak={handleDeleteStreakByObject}
            />
          </div>

          {/* Features Grid - Mobile First */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            {/* Notification Setup */}
            <div className="p-4 bg-white border border-gray-100 shadow-lg rounded-2xl sm:p-5 mobile-card">
              <div className="flex items-center mb-4 space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl">
                  <span className="text-lg text-white">🔔</span>
                </div>
                <h3 className="text-base font-bold text-gray-900 sm:text-lg">Notifications</h3>
              </div>
              <NotificationSetup />
            </div>

            {/* PWA Install Prompt */}
            <div className="p-4 bg-white border border-gray-100 shadow-lg rounded-2xl sm:p-5 mobile-card">
              <div className="flex items-center mb-4 space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl">
                  <span className="text-lg text-white">📱</span>
                </div>
                <h3 className="text-base font-bold text-gray-900 sm:text-lg">Install App</h3>
              </div>
              <PWAInstallPrompt />
            </div>
          </div>

          {/* Recent Notifications - Full Width */}
          <div className="p-4 bg-white border border-gray-100 shadow-lg rounded-3xl sm:p-6 mobile-card">
            <div className="flex items-center mb-4 space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl">
                <span className="text-lg text-white">📋</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 sm:text-xl">Recent Activity</h3>
            </div>
            <NotificationList />
          </div>

          {/* Error Display - Enhanced */}
          {error && (
            <div className="px-4 py-4 text-red-800 border border-red-200 shadow-lg bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl mobile-card">
              <div className="flex items-center space-x-2">
                <span className="text-red-500">⚠️</span>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Enhanced Modals */}
      {showForm && user && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-black bg-opacity-60 sm:items-center sm:p-4 backdrop-blur-sm">
          <div className="w-full p-6 bg-white border-t border-gray-100 shadow-2xl rounded-t-3xl sm:rounded-3xl sm:max-w-md sm:border">
            <StreakForm
              onSubmit={handleAddStreak}
              onCancel={() => setShowForm(false)}
              userId={user.id}
              isLoading={loading.form}
            />
          </div>
        </div>
      )}

      {showInvite && user && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-black bg-opacity-60 sm:items-center sm:p-4">
          <div className="w-full max-h-[95vh] overflow-y-auto bg-white shadow-2xl rounded-t-3xl sm:rounded-3xl sm:max-w-2xl sm:max-h-[90vh]">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 sm:text-xl">Friends System</h3>
                <button
                  onClick={() => setShowInvite(false)}
                  className="p-2 text-gray-400 transition-colors hover:text-gray-600 rounded-xl"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <SimpleFriends user={user} onFriendsChange={loadFriendsData} />
            </div>
          </div>
        </div>
      )}
      {showAIAdvisor && user && (
        <AIAdvisor
          streaks={recentStreaks}
          isVisible={showAIAdvisor}
          onClose={handleCloseAIAdvisor}
        />
      )}
    </div>
  );
};

export default DashboardPage;
