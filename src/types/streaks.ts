// TypeScript interfaces for the streak-based fitness app
// Updated to use database.ts types for consistency

import type { 
  Streak as DbStreak, 
  Friend as DbFriend, 
  Profile as DbProfile, 
  UserStreak as DbUserStreak 
} from './database';

// Re-export main types for convenience
export type Streak = DbStreak;
export type Profile = DbProfile;
export type UserStreak = DbUserStreak;

// Legacy types for backward compatibility
export type Friendship = DbFriend;
export type UserProfile = DbProfile;

export interface FriendWithStreak extends DbProfile {
  current_streak: number;
  friendship_status: 'accepted' | 'pending';
}

// Dropdown Options
export const SPORT_OPTIONS = [
  { value: 'gym', label: 'Gym' },
  { value: 'running', label: 'Running' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'swimming', label: 'Swimming' },
  { value: 'cycling', label: 'Cycling' },
  { value: 'other', label: 'Other' }
] as const;

export const GYM_CATEGORIES = [
  { value: 'chest', label: 'Chest' },
  { value: 'legs', label: 'Legs' },
  { value: 'back', label: 'Back' },
  { value: 'arms', label: 'Arms' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'core', label: 'Core' },
  { value: 'fullbody', label: 'Full Body' }
] as const;

export const MOOD_OPTIONS = [
  { value: 'gut', label: 'Gut 😊', emoji: '😊' },
  { value: 'mittel', label: 'Mittel 😐', emoji: '😐' },
  { value: 'schlecht', label: 'Schlecht 😞', emoji: '😞' }
] as const;

// Insert/Update types (using database types)
export type StreakInsert = Omit<DbStreak, 'id' | 'created_at' | 'updated_at'>;
export type StreakUpdate = Partial<Omit<DbStreak, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export type FriendshipInsert = Omit<DbFriend, 'id' | 'created_at'>;
export type FriendshipUpdate = Partial<Omit<DbFriend, 'id' | 'user_id' | 'friend_id' | 'created_at'>>;

// API Response types
export interface StreakStats {
  current_streak: number;
  longest_streak: number;
  total_days: number;
  this_week: number;
  this_month: number;
}

export interface ComparisonData {
  user: {
    id: string;
    name: string;
    streaks: Array<{ date: string; count: number }>;
  };
  friends: Array<{
    id: string;
    name: string;
    streaks: Array<{ date: string; count: number }>;
  }>;
}

// Extended Friends interfaces with Deep Link Support
// Note: These may need to be updated to match actual schema
export interface Friend {
  id: string;
  inviter_id: string;
  invitee_id?: string;
  invitee_email?: string;
  invite_token?: string;
  status: 'pending' | 'connected' | 'declined';
  created_at: string;
  connected_at?: string;
}

export interface FriendInvite {
  invitee_email: string;
  invite_message?: string;
}

export interface FriendWithProfile {
  id: string;
  friend_id: string;
  friend_email: string;
  friend_name: string;
  friend_avatar: string;
  friend_streak: number;
  connected_at: string;
}

export interface InviteLink {
  token: string;
  url: string;
  expires_at?: string;
}

export interface StreakComparison {
  user_id: string;
  user_name: string;
  streak_data: Array<{
    date: string;
    streak_count: number;
  }>;
}