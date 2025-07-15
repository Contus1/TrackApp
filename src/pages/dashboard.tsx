import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const flameTrailRef = useRef<HTMLDivElement>(null);
  const magneticButtonRef = useRef<HTMLButtonElement>(null);
  const magneticAIButtonRef = useRef<HTMLButtonElement>(null);

  // Advanced flame cursor trail effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (flameTrailRef.current) {
        const flame = document.createElement('div');
        flame.className = 'flame-trail';
        flame.style.left = e.clientX + 'px';
        flame.style.top = e.clientY + 'px';
        flame.innerHTML = '🔥';
        flameTrailRef.current.appendChild(flame);
        
        setTimeout(() => {
          if (flame.parentNode) {
            flame.parentNode.removeChild(flame);
          }
        }, 1500);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Magnetic button effects
  useEffect(() => {
    const buttons = [magneticButtonRef.current, magneticAIButtonRef.current].filter(Boolean);
    
    const handleMouseMove = (e: MouseEvent) => {
      buttons.forEach(button => {
        if (!button) return;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const distance = Math.sqrt(x * x + y * y);
        const maxDistance = 100;
        
        if (distance < maxDistance) {
          const strength = (maxDistance - distance) / maxDistance * 15;
          button.style.transform = `translate(${x * strength / maxDistance}px, ${y * strength / maxDistance}px) scale(1.05)`;
        }
      });
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (buttons.includes(target as HTMLButtonElement)) {
        target.style.transform = 'translate(0px, 0px) scale(1)';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    buttons.forEach(button => {
      button?.addEventListener('mouseleave', handleMouseLeave);
    });
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      buttons.forEach(button => {
        button?.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showForm || showInvite || showAIAdvisor) {
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    }

    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [showForm, showInvite, showAIAdvisor]);

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
      <>
        {/* Flame trail container */}
        <div ref={flameTrailRef} className="fixed inset-0 z-50 pointer-events-none">
          <style>{`
            .flame-trail {
              position: absolute;
              animation: flameTrail 1.5s ease-out forwards;
              pointer-events: none;
              font-size: 16px;
              z-index: 9999;
            }
            @keyframes flameTrail {
              0% { opacity: 0.8; transform: scale(1) rotate(0deg); }
              50% { opacity: 0.6; transform: scale(1.2) rotate(180deg); }
              100% { opacity: 0; transform: scale(0.3) rotate(360deg) translateY(-30px); }
            }
          `}</style>
        </div>

        <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full shadow-xl bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500">
              <span className="text-2xl animate-bounce">🔥</span>
            </div>
            <h2 className="mb-4 text-2xl font-bold text-white">
              Not logged in
            </h2>
            <p className="mb-6 text-gray-300">
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
      </>
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
    <>
      {/* Flame trail container */}
      <div ref={flameTrailRef} className="fixed inset-0 z-50 pointer-events-none">
        <style>{`
          .flame-trail {
            position: absolute;
            animation: flameTrail 1.5s ease-out forwards;
            pointer-events: none;
            font-size: 16px;
            z-index: 9999;
          }
          @keyframes flameTrail {
            0% { opacity: 0.8; transform: scale(1) rotate(0deg); }
            50% { opacity: 0.6; transform: scale(1.2) rotate(180deg); }
            100% { opacity: 0; transform: scale(0.3) rotate(360deg) translateY(-30px); }
          }
        `}</style>
      </div>

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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

        <div className="relative z-10">
          <DashboardHeader user={user} onLogout={onLogout} onProfileClick={handleProfileClick} />
          
          <main className="pb-20 safe-bottom">
            <div className="space-y-6 mobile-container sm:space-y-8">
              {/* Floating Action Buttons - Enhanced */}
              <div className="flex items-center justify-center pt-4 space-x-4 sm:space-x-6">
                <div className="relative">
                  <div className="absolute opacity-50 -inset-1 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-3xl blur-lg animate-pulse"></div>
                  <button
                    ref={magneticButtonRef}
                    onClick={() => setShowForm(true)}
                    className="relative flex items-center justify-center w-16 h-16 text-2xl font-bold text-white transition-all duration-200 transform border shadow-xl sm:w-18 sm:h-18 bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 hover:from-orange-600 hover:via-red-600 hover:to-pink-700 rounded-3xl sm:text-3xl hover:shadow-2xl active:scale-95 border-white/20"
                    aria-label="Add workout"
                    style={{ transition: 'transform 0.1s ease-out' }}
                  >
                    +
                  </button>
                </div>
                
                <div className="relative">
                  <div className="absolute opacity-50 -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-3xl blur-lg animate-pulse"></div>
                  <button
                    ref={magneticAIButtonRef}
                    onClick={handleShowAIAdvisor}
                    className="relative flex items-center justify-center text-xl text-white transition-all duration-200 transform border shadow-xl w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 hover:from-indigo-600 hover:via-purple-600 hover:to-blue-700 rounded-3xl sm:text-2xl hover:shadow-2xl active:scale-95 border-white/20"
                    title="AI Training Coach"
                    aria-label="Open AI Coach"
                    style={{ transition: 'transform 0.1s ease-out' }}
                  >
                    🤖
                  </button>
                </div>
              </div>

              {/* Current Streak Display - Enhanced */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                <div className="relative p-1 border shadow-2xl bg-white/10 backdrop-blur-xl rounded-3xl border-white/20">
                  <StreakDisplay 
                    currentStreak={currentStreak} 
                    isLoading={loading.streak} 
                  />
                </div>
              </div>

              {/* AI Quick Insight - Enhanced */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                <div className="relative border shadow-2xl bg-white/10 backdrop-blur-xl rounded-3xl border-white/20">
                  <QuickAIInsight 
                    streaks={recentStreaks}
                    onOpenFullAnalysis={handleShowAIAdvisor}
                  />
                </div>
              </div>

              {/* Friends Section - Enhanced */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                <div className="relative p-4 border shadow-2xl bg-white/10 backdrop-blur-xl rounded-3xl sm:p-6 border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white sm:text-xl">Training Partners</h3>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <FriendsBar
                    friends={friends}
                    isLoading={loading.friends}
                    onFriendClick={handleFriendClick}
                    onManageFriends={handleInviteFriend}
                  />
                </div>
              </div>

              {/* Timeline Graph - Enhanced */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                <div className="relative p-4 border shadow-2xl bg-white/10 backdrop-blur-xl rounded-3xl sm:p-6 border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white sm:text-xl">Your Progress</h3>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-xs text-gray-300">Last 30 days</span>
                    </div>
                  </div>
                  <TimelineGraph
                    streaks={recentStreaks}
                    isLoading={loading.timeline}
                    onDeleteStreak={handleDeleteStreakByObject}
                  />
                </div>
              </div>

              {/* Features Grid - Enhanced */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                {/* Notification Setup */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative p-4 border shadow-xl bg-white/10 backdrop-blur-xl rounded-3xl sm:p-5 border-white/20">
                    <div className="flex items-center mb-4 space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl">
                        <span className="text-lg text-white">🔔</span>
                      </div>
                      <h3 className="text-base font-bold text-white sm:text-lg">Notifications</h3>
                    </div>
                    <NotificationSetup />
                  </div>
                </div>

                {/* PWA Install Prompt */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative p-4 border shadow-xl bg-white/10 backdrop-blur-xl rounded-3xl sm:p-5 border-white/20">
                    <div className="flex items-center mb-4 space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl">
                        <span className="text-lg text-white">📱</span>
                      </div>
                      <h3 className="text-base font-bold text-white sm:text-lg">Install App</h3>
                    </div>
                    <PWAInstallPrompt />
                  </div>
                </div>
              </div>

              {/* Recent Notifications - Enhanced */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                <div className="relative p-4 border shadow-2xl bg-white/10 backdrop-blur-xl rounded-3xl sm:p-6 border-white/20">
                  <div className="flex items-center mb-4 space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl">
                      <span className="text-lg text-white">📋</span>
                    </div>
                    <h3 className="text-lg font-bold text-white sm:text-xl">Recent Activity</h3>
                  </div>
                  <NotificationList />
                </div>
              </div>

              {/* Error Display - Enhanced */}
              {error && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-rose-600 rounded-3xl blur opacity-50 group-hover:opacity-70 transition duration-1000"></div>
                  <div className="relative px-4 py-4 border shadow-lg bg-red-500/20 backdrop-blur-xl rounded-3xl border-red-400/30">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-300">⚠️</span>
                      <span className="font-medium text-red-200">{error}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>

          <Footer />
        </div>
      </div>

      {/* Enhanced Modals */}
      {showForm && user && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-black bg-opacity-60 sm:items-center sm:p-4 backdrop-blur-sm">
          <div className="relative w-full group sm:max-w-lg">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-t-3xl sm:rounded-3xl blur opacity-50"></div>
            <div className="relative w-full p-4 sm:p-6 border-t shadow-2xl bg-white/10 backdrop-blur-xl border-white/20 sm:border rounded-t-3xl sm:rounded-3xl mobile-form-modal">
              <StreakForm
                onSubmit={handleAddStreak}
                onCancel={() => setShowForm(false)}
                userId={user.id}
                isLoading={loading.form}
              />
            </div>
          </div>
        </div>
      )}

      {showInvite && user && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-black bg-opacity-60 sm:items-center sm:p-4 backdrop-blur-sm">
          <div className="relative group w-full max-h-[95vh] overflow-y-auto sm:max-w-2xl sm:max-h-[90vh]">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-3xl sm:rounded-3xl blur opacity-50"></div>
            <div className="relative border-t shadow-2xl bg-white/10 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl border-white/20 sm:border">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white sm:text-xl">Friends System</h3>
                  <button
                    onClick={() => setShowInvite(false)}
                    className="p-2 text-gray-300 transition-colors hover:text-white rounded-xl bg-white/10"
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
        </div>
      )}

      {showAIAdvisor && user && (
        <AIAdvisor
          streaks={recentStreaks}
          isVisible={showAIAdvisor}
          onClose={handleCloseAIAdvisor}
        />
      )}
    </>
  );
};

export default DashboardPage;
