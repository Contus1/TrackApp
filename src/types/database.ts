// TypeScript interfaces for TrackApp Supabase Database Schema
// Updated to match the actual schema from screenshots

// Profiles table (from auth.users)
export interface Profile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

// Streaks table 
export interface Streak {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD format
  sport: 'gym' | 'running' | 'yoga' | 'swimming' | 'cycling' | 'other';
  category?: 'chest' | 'legs' | 'back' | 'arms' | 'shoulders' | 'core' | 'fullbody';
  mood: 'gut' | 'mittel' | 'schlecht';
  created_at: string;
  updated_at?: string;
}

// Friends table
export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at?: string;
}

// Notifications table (if exists)
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  updated_at?: string;
}

// Legacy interfaces for backward compatibility
export interface Exercise {
  id: string;
  user_id: string;
  name: string;
  category: 'kraft' | 'cardio' | 'flexibilität' | 'other';
  description?: string;
  sets?: number;
  reps?: number;
  weight?: number; // in kg
  duration?: number; // in Minuten
  calories_burned?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  last_performed?: string;
}

export interface Workout {
  id: string;
  user_id: string;
  name: string;
  start_time: string;
  end_time?: string;
  status: 'active' | 'completed' | 'cancelled';
  total_duration?: number; // in Minuten
  total_calories?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  sets_completed: number;
  reps_completed: number;
  weight_used?: number;
  duration_minutes?: number;
  order_index: number;
  notes?: string;
  completed_at?: string;
  created_at: string;
}

// Use Profile instead of UserProfile for consistency with Supabase schema
export interface UserProfile extends Profile {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  height?: number; // in cm
  weight?: number; // in kg
  fitness_goal?: 'abnehmen' | 'zunehmen' | 'muskeln_aufbauen' | 'ausdauer_verbessern' | 'gesund_bleiben';
  activity_level?: 'niedrig' | 'mittel' | 'hoch' | 'sehr_hoch';
}

export interface FitnessGoal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_value?: number;
  current_value: number;
  unit?: string; // z.B. 'kg', 'minuten', 'wiederholungen'
  target_date?: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// Insert/Update types for main tables (matching schema)
export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at'>>;

export type StreakInsert = Omit<Streak, 'id' | 'created_at' | 'updated_at'>;
export type StreakUpdate = Partial<Omit<Streak, 'id' | 'user_id' | 'created_at'>>;

export type FriendInsert = Omit<Friend, 'id' | 'created_at' | 'updated_at'>;
export type FriendUpdate = Partial<Omit<Friend, 'id' | 'user_id' | 'friend_id' | 'created_at'>>;

export type NotificationInsert = Omit<Notification, 'id' | 'created_at' | 'updated_at'>;
export type NotificationUpdate = Partial<Omit<Notification, 'id' | 'user_id' | 'created_at'>>;

// Legacy Insert/Update types for compatibility
export type ExerciseInsert = Omit<Exercise, 'id' | 'created_at' | 'updated_at'>;
export type WorkoutInsert = Omit<Workout, 'id' | 'created_at' | 'updated_at'>;
export type WorkoutExerciseInsert = Omit<WorkoutExercise, 'id' | 'created_at'>;
export type UserProfileInsert = Omit<UserProfile, 'created_at' | 'updated_at'>;
export type FitnessGoalInsert = Omit<FitnessGoal, 'id' | 'created_at' | 'updated_at'>;

export type ExerciseUpdate = Partial<Omit<Exercise, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
export type WorkoutUpdate = Partial<Omit<Workout, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
export type WorkoutExerciseUpdate = Partial<Omit<WorkoutExercise, 'id' | 'workout_id' | 'exercise_id' | 'created_at'>>;
export type UserProfileUpdate = Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>;
export type FitnessGoalUpdate = Partial<Omit<FitnessGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

// Helper interfaces for queries with joined data
export interface FriendWithProfile {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
  connected_at: string; // Added for compatibility
  friend_profile?: Profile;
  friend_email: string;
  friend_name: string;
  friend_avatar: string;
  friend_streak: number;
}

export interface UserStreak {
  user_id: string;
  current_streak: number;
  last_activity_date?: string;
}
export interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    firstName?: string;
    lastName?: string;
    [key: string]: unknown;
  };
  created_at: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: AuthUser;
}

// API Response Typen
export interface SupabaseResponse<T> {
  data: T | null;
  error: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null;
}

// Subscription Payload Typ
export interface RealtimePayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
  errors: string[] | null;
}

// Streak comparison and analysis types
export interface StreakComparison {
  user_id: string;
  user_name: string;
  streak_data: Array<{
    date: string;
    streak_count: number;
  }>;
}

export interface StreakStats {
  current_streak: number;
  longest_streak: number;
  total_days: number;
  this_week: number;
  this_month: number;
}
