// TypeScript-Interfaces für die TrackApp-Datenbank

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

export interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  height?: number; // in cm
  weight?: number; // in kg
  fitness_goal?: 'abnehmen' | 'zunehmen' | 'muskeln_aufbauen' | 'ausdauer_verbessern' | 'gesund_bleiben';
  activity_level?: 'niedrig' | 'mittel' | 'hoch' | 'sehr_hoch';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
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

// Typ für Datenbank-Inserts (ohne automatische Felder)
export type ExerciseInsert = Omit<Exercise, 'id' | 'created_at' | 'updated_at'>;
export type WorkoutInsert = Omit<Workout, 'id' | 'created_at' | 'updated_at'>;
export type WorkoutExerciseInsert = Omit<WorkoutExercise, 'id' | 'created_at'>;
export type UserProfileInsert = Omit<UserProfile, 'created_at' | 'updated_at'>;
export type FitnessGoalInsert = Omit<FitnessGoal, 'id' | 'created_at' | 'updated_at'>;

// Typ für Datenbank-Updates (alle Felder optional außer ID)
export type ExerciseUpdate = Partial<Omit<Exercise, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
export type WorkoutUpdate = Partial<Omit<Workout, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
export type WorkoutExerciseUpdate = Partial<Omit<WorkoutExercise, 'id' | 'workout_id' | 'exercise_id' | 'created_at'>>;
export type UserProfileUpdate = Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>;
export type FitnessGoalUpdate = Partial<Omit<FitnessGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

// Auth-bezogene Typen
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
