import { supabase } from './supabase';
import type { 
  StreakInsert, 
  StreakUpdate, 
  FriendshipInsert,
  FriendWithStreak,
  StreakStats,
  ComparisonData 
} from '../types/streaks';

// Streak Service für CRUD-Operationen
export const streakService = {
  // Alle Streaks eines Users abrufen
  async getUserStreaks(userId: string) {
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    return { data, error };
  },

  // Streak für heute abrufen
  async getTodayStreak(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();
    
    return { data, error };
  },

  // Neuen Streak erstellen
  async createStreak(streakData: StreakInsert) {
    const { data, error } = await supabase
      .from('streaks')
      .insert([streakData])
      .select()
      .single();
    
    return { data, error };
  },

  // Streak aktualisieren
  async updateStreak(id: string, updates: StreakUpdate) {
    const { data, error } = await supabase
      .from('streaks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  },

  // Streak löschen
  async deleteStreak(id: string) {
    const { error } = await supabase
      .from('streaks')
      .delete()
      .eq('id', id);
    
    return { error };
  },

  // Aktuelle Streak-Länge eines Users
  async getCurrentStreak(userId: string): Promise<{ data: number | null; error: unknown }> {
    const { data, error } = await supabase
      .from('user_current_streaks')
      .select('current_streak')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      return { data: 0, error };
    }
    
    return { data: data?.current_streak || 0, error: null };
  },

  // Streak-Statistiken
  async getStreakStats(userId: string): Promise<{ data: StreakStats | null; error: unknown }> {
    const { data, error } = await supabase.rpc('get_user_streak_stats', {
      p_user_id: userId
    });
    
    return { data, error };
  },

  // Letzte N Streaks für Timeline
  async getRecentStreaks(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);
    
    return { data, error };
  }
};

// Friendship Service
export const friendshipService = {
  // Alle Freunde eines Users
  async getUserFriends(userId: string) {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        friend:auth.users!friendships_friend_id_fkey(
          id,
          email,
          user_metadata
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted');
    
    return { data, error };
  },

  // Freunde mit ihren aktuellen Streaks
  async getFriendsWithStreaks(userId: string): Promise<{ data: FriendWithStreak[] | null; error: unknown }> {
    try {
      // Get friends from friends_simple view
      const { data: friendsData, error: friendsError } = await supabase
        .from('friends_simple')
        .select('*')
        .eq('user_id', userId);
      
      if (friendsError) {
        return { data: null, error: friendsError };
      }

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

      return { data: friendsWithStreaks, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Freundschaftsanfrage senden
  async sendFriendRequest(userId: string, friendEmail: string) {
    // Erst User-ID des Freundes finden
    const { data: friendData, error: friendError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', friendEmail)
      .single();
    
    if (friendError || !friendData) {
      return { data: null, error: { message: 'Benutzer nicht gefunden' } };
    }

    const friendship: FriendshipInsert = {
      user_id: userId,
      friend_id: friendData.id,
      status: 'pending'
    };

    const { data, error } = await supabase
      .from('friendships')
      .insert([friendship])
      .select()
      .single();
    
    return { data, error };
  },

  // Freundschaftsanfrage akzeptieren
  async acceptFriendRequest(friendshipId: string) {
    const { data, error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId)
      .select()
      .single();
    
    return { data, error };
  },

  // Freundschaft entfernen
  async removeFriend(friendshipId: string) {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);
    
    return { error };
  }
};

// Vergleichs-Service für Streak-Vergleiche
export const comparisonService = {
  // Daten für Streak-Vergleich zwischen User und Freunden
  async getComparisonData(userId: string, days = 30): Promise<{ data: ComparisonData | null; error: unknown }> {
    const { data, error } = await supabase.rpc('get_streak_comparison_data', {
      p_user_id: userId,
      p_days: days
    });
    
    return { data, error };
  }
};

// Realtime Subscriptions für Streaks
export const streakSubscriptions = {
  // Streak-Änderungen abonnieren
  subscribeToUserStreaks(userId: string, callback: (payload: unknown) => void) {
    return supabase
      .channel('user-streaks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'streaks',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  // Freundschafts-Änderungen abonnieren
  subscribeToUserFriendships(userId: string, callback: (payload: unknown) => void) {
    return supabase
      .channel('user-friendships')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }
};
