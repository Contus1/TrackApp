// Friends Service für aktuelles Supabase Schema
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from './supabase';

export const friendsService = {
  // Freunde abrufen (neue simple_friendships table)
  async getConnectedFriends(userId: string) {
    try {
      console.log('Getting connected friends for user:', userId);
      
      const { data: friendships, error } = await supabase
        .from('simple_friendships')
        .select('*')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`);
      
      if (error) {
        console.error('Friends query error:', error);
        return { data: [], error: null }; // Return empty array instead of error
      }
      
      if (!friendships || friendships.length === 0) {
        return { data: [], error: null };
      }
      
      // Get friend IDs (could be in either user_id or friend_id column)
      const friendIds = friendships.map(friendship => 
        friendship.user_id === userId ? friendship.friend_id : friendship.user_id
      );
      
      // Get profiles for friends
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', friendIds);
      
      if (profileError) {
        console.error('Profiles query error:', profileError);
        return { data: [], error: null };
      }
      
      // Combine friendship data with profiles
      const friendsWithProfiles = friendIds.map(friendId => {
        const profile = profiles?.find(p => p.id === friendId);
        const friendship = friendships.find(f => 
          (f.user_id === userId && f.friend_id === friendId) ||
          (f.friend_id === userId && f.user_id === friendId)
        );
        
        return {
          id: friendship?.id || friendId,
          user_id: userId,
          friend_id: friendId,
          status: 'accepted', // Simple friendships are always accepted
          created_at: friendship?.created_at || new Date().toISOString(),
          connected_at: friendship?.created_at || new Date().toISOString(),
          friend_profile: profile,
          friend_email: profile?.friend_code || '',
          friend_name: profile?.display_name || `Friend ${profile?.friend_code || ''}`,
          friend_avatar: profile?.avatar_url || '',
          friend_streak: 0 // TODO: Calculate actual streak
        };
      });
      
      return { data: friendsWithProfiles, error: null };
    } catch (error) {
      console.error('Get connected friends error:', error);
      return { data: [], error: null };
    }
  },

  // Freund entfernen (simple_friendships table)
  async removeFriend(userId: string, friendId: string) {
    try {
      console.log('Removing friend relationship between:', userId, 'and', friendId);
      
      // Remove friendship (works for both directions since we query with OR)
      const { error } = await supabase
        .from('simple_friendships')
        .delete()
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);
      
      if (error) {
        console.error('Failed to remove friendship:', error);
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  }
};

// Simplified Streak Comparison Service 
export const streakComparisonService = {
  async getStreakComparison(userId: string, days = 30) {
    try {
      console.log('Getting streak comparison for user:', userId, 'for', days, 'days');
      return { data: [], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  calculateStreakCurve() {
    return [];
  }
};
