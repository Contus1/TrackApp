import React, { useState, useEffect, useCallback } from 'react';
import { streakService, friendshipService, streakSubscriptions } from '../services/streakService';
import type { User } from '@supabase/supabase-js';
import type { Streak, FriendWithStreak, StreakInsert } from '../types/streaks';
import Header from '../components/Header';
import Footer from '../components/Footer';
import StreakForm from '../components/StreakForm';
import StreakDisplay from '../components/StreakDisplay';
import FriendsBar from '../components/FriendsBar';
import Timeline from '../components/Timeline';
import SimpleInvite from '../components/SimpleInvite';

interface DashboardPageProps {
  onLogout: () => void;
  user?: User | null;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout, user }) => {
  // State Management
  const [currentStreak, setCurrentStreak] = useState(0);
  const [recentStreaks, setRecentStreaks] = useState<Streak[]>([]);
  const [friends, setFriends] = useState<FriendWithStreak[]>([]);
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
      const { data, error } = await friendshipService.getFriendsWithStreaks(user.id);
      
      if (error) {
        console.error('Error loading friends:', error);
      } else {
        setFriends(data || []);
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

      const { error } = await streakService.createStreak(streakData);
      
      if (error) {
        throw new Error('Fehler beim Speichern des Trainings');
      }

      setShowForm(false);
      // Data will be updated via real-time subscription
    } catch (err) {
      console.error('Error creating streak:', err);
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  const handleDeleteStreak = async (streakId: string) => {
    if (!window.confirm('Training-Eintrag wirklich löschen?')) return;

    try {
      const { error } = await streakService.deleteStreak(streakId);
      
      if (error) {
        throw new Error('Fehler beim Löschen des Trainings');
      }

      // Data will be updated via real-time subscription
    } catch (err) {
      console.error('Error deleting streak:', err);
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen');
    }
  };

  const handleFriendClick = (friend: FriendWithStreak) => {
    console.log('Friend clicked:', friend);
    // Hier könnte später ein Friend-Detail Modal geöffnet werden
  };

  const handleInviteFriend = () => {
    setShowInvite(true);
  };

  // Loading state
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header title="Fitness Streaks" />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Nicht angemeldet
            </h2>
            <p className="text-gray-600 mb-4">
              Bitte melden Sie sich an, um das Dashboard zu verwenden.
            </p>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg"
            >
              Zur Anmeldung
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header title="Fitness Streaks" />
      
      <main className="flex-1 py-6">
        <div className="mobile-container space-y-6">
          {/* Add Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowForm(true)}
              className="w-16 h-16 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg transition-colors"
            >
              +
            </button>
          </div>

          {/* Current Streak Display */}
          <StreakDisplay 
            currentStreak={currentStreak} 
            isLoading={loading.streak} 
          />

          {/* Friends Bar */}
          <FriendsBar
            friends={friends}
            isLoading={loading.friends}
            onFriendClick={handleFriendClick}
            onInviteFriend={handleInviteFriend}
          />

          {/* Timeline */}
          <Timeline
            streaks={recentStreaks}
            isLoading={loading.timeline}
            onDeleteStreak={handleDeleteStreak}
          />

          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Modals */}
      {showForm && (
        <StreakForm
          onSubmit={handleAddStreak}
          onCancel={() => setShowForm(false)}
          userId={user.id}
          isLoading={loading.form}
        />
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
