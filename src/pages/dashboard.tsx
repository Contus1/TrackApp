import React, { useState, useEffect, useCallback } from 'react';
import { streakService, streakSubscriptions } from '../services/streakService';
import { supabase } from '../services/supabase';
import type { User } from '@supabase/supabase-js';
import type { Streak, FriendWithStreak, StreakInsert } from '../types/streaks';
import DashboardHeader from '../components/DashboardHeader';
import Footer from '../components/Footer';
import StreakForm from '../components/StreakForm';
import StreakDisplay from '../components/StreakDisplay';
import FriendsBar from '../components/FriendsBar';
import TimelineGraph from '../components/TimelineGraph';
import SimpleInvite from '../components/SimpleInvite';
import FriendProfile from '../components/FriendProfile';
import ProfilePage from './profile';
import NotificationSetup from '../components/NotificationSetup';
import NotificationList from '../components/NotificationList';
import PWAInstallPrompt from '../components/PWAInstallPrompt';

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
      
      // Hole alle verbundenen Freunde direkt aus der friends-Tabelle
      const { data: friendsData, error } = await supabase
        .from('friends')
        .select('*')
        .eq('status', 'connected')
        .or(`inviter_id.eq.${user.id},invitee_id.eq.${user.id}`);
      
      if (error) {
        console.error('Error loading friends:', error);
      } else {
        // Sammle alle Freunde-IDs
        const friendIds = (friendsData || []).map(friendship => 
          friendship.inviter_id === user.id ? friendship.invitee_id : friendship.inviter_id
        );
        
        // Hole Benutzerdaten für alle Freunde aus der profiles Tabelle
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', friendIds);
        
        // Hole auch E-Mail-Daten falls Profile nicht vollständig sind
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, email, created_at')
          .in('id', friendIds);
        
        if (profilesError) {
          console.error('Error loading profiles data:', profilesError);
        }
        if (usersError) {
          console.error('Error loading user data:', usersError);
        }
        
        // Konvertiere zu FriendWithStreak Format
        const friendsWithStreaks: FriendWithStreak[] = (friendsData || []).map(friendship => {
          const friendId = friendship.inviter_id === user.id ? friendship.invitee_id : friendship.inviter_id;
          const friendUser = usersData?.find(u => u.id === friendId);
          const friendProfile = profilesData?.find(p => p.id === friendId);
          
          return {
            id: friendId || '',
            display_name: friendProfile?.display_name || friendUser?.email?.split('@')[0] || 'Freund',
            email: friendUser?.email || '',
            avatar_url: undefined,
            current_streak: 0,
            max_streak: 0,
            last_activity: friendship.connected_at,
            friendship_status: 'accepted' as const,
            created_at: friendship.connected_at
          };
        });
        
        setFriends(friendsWithStreaks);
      }
    } catch (err) {
      console.error('Friends loading failed:', err);
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
    console.log('Friend clicked:', friend);
    setSelectedFriend(friend);
  };

  const handleBackFromFriend = () => {
    setSelectedFriend(null);
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

  // Loading state
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 mb-6">
            <span className="text-2xl">🔥</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Not logged in
          </h2>
          <p className="text-gray-600 mb-6">
            Please log in to track your workouts.
          </p>
          <button
            onClick={onLogout}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
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
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <DashboardHeader user={user} onLogout={onLogout} onProfileClick={handleProfileClick} />
      
      <main className="pb-20">
        <div className="px-6 py-8 space-y-8">
          {/* Add Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowForm(true)}
              className="w-16 h-16 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 hover:from-orange-600 hover:via-red-600 hover:to-orange-700 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              +
            </button>
          </div>

          {/* Current Streak Display */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <StreakDisplay 
              currentStreak={currentStreak} 
              isLoading={loading.streak} 
            />
          </div>

          {/* Friends Bar */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <FriendsBar
              friends={friends}
              isLoading={loading.friends}
              onFriendClick={handleFriendClick}
              onInviteFriend={handleInviteFriend}
            />
          </div>

          {/* Timeline Graph */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <TimelineGraph
              streaks={recentStreaks}
              isLoading={loading.timeline}
              onDeleteStreak={handleDeleteStreakByObject}
            />
          </div>

          {/* Notification Setup */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Push Notifications</h3>
            <NotificationSetup />
          </div>

          {/* PWA Install Prompt */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Install App</h3>
            <PWAInstallPrompt />
          </div>

          {/* Recent Notifications */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <NotificationList />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-2xl">
              {error}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Modals */}
      {showForm && user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
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
        <SimpleInvite
          user={user}
          onClose={() => setShowInvite(false)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
