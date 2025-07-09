// TypeScript-Interfaces für die Streak-basierte Fitness-App

export interface Streak {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD Format
  sport: 'gym' | 'laufen' | 'yoga' | 'schwimmen' | 'radfahren' | 'other';
  category?: 'brust' | 'beine' | 'rücken' | 'arme' | 'schultern' | 'core' | 'ganzkörper';
  mood: 'gut' | 'mittel' | 'schlecht';
  created_at: string;
  updated_at: string;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface UserStreak {
  user_id: string;
  current_streak: number;
  last_activity_date?: string;
}

export interface FriendWithStreak extends UserProfile {
  current_streak: number;
  friendship_status: 'accepted' | 'pending';
}

// Dropdown-Optionen
export const SPORT_OPTIONS = [
  { value: 'gym', label: 'Gym' },
  { value: 'laufen', label: 'Laufen' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'schwimmen', label: 'Schwimmen' },
  { value: 'radfahren', label: 'Radfahren' },
  { value: 'other', label: 'Andere' }
] as const;

export const GYM_CATEGORIES = [
  { value: 'brust', label: 'Brust' },
  { value: 'beine', label: 'Beine' },
  { value: 'rücken', label: 'Rücken' },
  { value: 'arme', label: 'Arme' },
  { value: 'schultern', label: 'Schultern' },
  { value: 'core', label: 'Core' },
  { value: 'ganzkörper', label: 'Ganzkörper' }
] as const;

export const MOOD_OPTIONS = [
  { value: 'gut', label: 'Gut 😊', emoji: '😊' },
  { value: 'mittel', label: 'Mittel 😐', emoji: '😐' },
  { value: 'schlecht', label: 'Schlecht 😞', emoji: '😞' }
] as const;

// Insert/Update Typen
export type StreakInsert = Omit<Streak, 'id' | 'created_at' | 'updated_at'>;
export type StreakUpdate = Partial<Omit<Streak, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export type FriendshipInsert = Omit<Friendship, 'id' | 'created_at'>;
export type FriendshipUpdate = Partial<Omit<Friendship, 'id' | 'user_id' | 'friend_id' | 'created_at'>>;

// API Response Typen
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

// Erweiterte Friends-Interfaces mit Deep Link Support
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
