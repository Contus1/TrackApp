import { createClient } from '@supabase/supabase-js';
import type { Session } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../config/supabase-config';

// Verwende statische Konfiguration als primäre Quelle
const supabaseUrl = SUPABASE_CONFIG.url;
const supabaseAnonKey = SUPABASE_CONFIG.anonKey;

console.log('🔧 Supabase Config (Static):', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  keyPreview: supabaseAnonKey?.substring(0, 20) + '...'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration missing!');
  console.error('URL:', supabaseUrl);
  console.error('Key:', supabaseAnonKey ? 'Present' : 'Missing');
} else {
  console.log('✅ Supabase configuration loaded successfully');
}

// Supabase-Client erstellen - keine Fallbacks mehr nötig
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Basic Types
interface Exercise {
  id: string;
  user_id: string;
  name: string;
  category: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  last_performed?: Date;
}

interface UserMetadata {
  firstName?: string;
  lastName?: string;
  [key: string]: unknown;
}

// Auth-Helper-Funktionen
export const authService = {
  // Benutzer registrieren
  async signUp(email: string, password: string, userData?: UserMetadata) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  },

  // Benutzer anmelden
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Benutzer abmelden
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Aktueller Benutzer
  getCurrentUser() {
    return supabase.auth.getUser();
  },

  // Session abrufen
  getSession() {
    return supabase.auth.getSession();
  },

  // Auth-Status-Änderungen überwachen
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Passwort zurücksetzen
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  }
};

// Database-Helper-Funktionen für Übungen
export const exerciseService = {
  // Alle Übungen eines Benutzers abrufen
  async getUserExercises(userId: string) {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // Neue Übung erstellen
  async createExercise(exerciseData: Partial<Exercise>) {
    const { data, error } = await supabase
      .from('exercises')
      .insert([exerciseData])
      .select();
    
    return { data, error };
  },

  // Übung aktualisieren
  async updateExercise(id: string, updates: Partial<Exercise>) {
    const { data, error } = await supabase
      .from('exercises')
      .update(updates)
      .eq('id', id)
      .select();
    
    return { data, error };
  },

  // Übung löschen
  async deleteExercise(id: string) {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', id);
    
    return { error };
  }
};

// Database-Helper-Funktionen für Trainingseinheiten
export const workoutService = {
  // Alle Trainingseinheiten eines Benutzers abrufen
  async getUserWorkouts(userId: string) {
    const { data, error } = await supabase
      .from('workouts')
      .select(`
        *,
        workout_exercises (
          *,
          exercises (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // Neue Trainingseinheit erstellen
  async createWorkout(workoutData: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('workouts')
      .insert([workoutData])
      .select();
    
    return { data, error };
  },

  // Trainingseinheit beenden
  async finishWorkout(id: string, endTime: string) {
    const { data, error } = await supabase
      .from('workouts')
      .update({ 
        end_time: endTime,
        status: 'completed'
      })
      .eq('id', id)
      .select();
    
    return { data, error };
  }
};

// Real-time Subscriptions
export const subscriptions = {
  // Übungen-Updates überwachen
  subscribeToExerciseChanges(userId: string, callback: (payload: unknown) => void) {
    return supabase
      .channel('exercises')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'exercises',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  // Trainingseinheiten-Updates überwachen
  subscribeToWorkoutChanges(userId: string, callback: (payload: unknown) => void) {
    return supabase
      .channel('workouts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workouts',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }
};

// Utility-Funktionen
export const utils = {
  // Fehler formatieren
  formatSupabaseError(error: { message?: string } | null): string {
    if (!error) return '';
    
    // Deutsche Übersetzungen für häufige Supabase-Fehler
    const errorMessages: { [key: string]: string } = {
      'Invalid login credentials': 'Ungültige Anmeldedaten',
      'Email not confirmed': 'E-Mail-Adresse nicht bestätigt',
      'User already registered': 'Benutzer bereits registriert',
      'Password should be at least 6 characters': 'Passwort sollte mindestens 6 Zeichen haben',
      'Invalid email format': 'Ungültiges E-Mail-Format',
      'Network error': 'Netzwerkfehler. Bitte versuchen Sie es erneut.'
    };

    return errorMessages[error.message || ''] || error.message || 'Ein unbekannter Fehler ist aufgetreten';
  },

  // Benutzer-Profil formatieren
  formatUserProfile(user: { 
    id: string; 
    email?: string; 
    user_metadata?: UserMetadata; 
    created_at?: string;
  }) {
    return {
      id: user.id,
      email: user.email || '',
      firstName: user.user_metadata?.firstName || '',
      lastName: user.user_metadata?.lastName || '',
      fullName: `${user.user_metadata?.firstName || ''} ${user.user_metadata?.lastName || ''}`.trim(),
      createdAt: user.created_at || ''
    };
  }
};

export default supabase;
