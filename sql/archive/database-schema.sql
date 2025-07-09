-- TrackApp Database Schema
-- Führen Sie dieses Script in Ihrem Supabase SQL Editor aus
-- Dashboard → SQL Editor → New query

-- 1. Übungen-Tabelle (Exercises)
CREATE TABLE IF NOT EXISTS exercises (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('kraft', 'cardio', 'flexibilität', 'other')),
  description text,
  sets integer,
  reps integer,
  weight numeric(5,2), -- Gewicht in kg mit 2 Dezimalstellen
  duration integer, -- Dauer in Minuten
  calories_burned integer,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  last_performed timestamptz
);

-- 2. Trainingseinheiten-Tabelle (Workouts)
CREATE TABLE IF NOT EXISTS workouts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  start_time timestamptz DEFAULT now() NOT NULL,
  end_time timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  total_duration integer, -- Gesamtdauer in Minuten
  total_calories integer,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 3. Trainingseinheiten-Übungen Verknüpfung (Workout Exercises)
CREATE TABLE IF NOT EXISTS workout_exercises (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id uuid REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
  exercise_id uuid REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  sets_completed integer DEFAULT 0,
  reps_completed integer DEFAULT 0,
  weight_used numeric(5,2),
  duration_minutes integer,
  order_index integer DEFAULT 0,
  notes text,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 4. Benutzer-Profile (User Profiles)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name text,
  last_name text,
  date_of_birth date,
  height integer, -- Größe in cm
  weight numeric(5,2), -- Gewicht in kg
  fitness_goal text CHECK (fitness_goal IN ('abnehmen', 'zunehmen', 'muskeln_aufbauen', 'ausdauer_verbessern', 'gesund_bleiben')),
  activity_level text CHECK (activity_level IN ('niedrig', 'mittel', 'hoch', 'sehr_hoch')),
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 5. Trainings-Ziele (Fitness Goals)
CREATE TABLE IF NOT EXISTS fitness_goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  target_value numeric(10,2),
  current_value numeric(10,2) DEFAULT 0,
  unit text, -- z.B. 'kg', 'minuten', 'wiederholungen'
  target_date date,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_exercises_user_id ON exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_last_performed ON exercises(last_performed);

CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_start_time ON workouts(start_time);
CREATE INDEX IF NOT EXISTS idx_workouts_status ON workouts(status);

CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise_id ON workout_exercises(exercise_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);

CREATE INDEX IF NOT EXISTS idx_fitness_goals_user_id ON fitness_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_fitness_goals_status ON fitness_goals(status);

-- Row Level Security (RLS) Policies
-- Aktiviere RLS für alle Tabellen
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_goals ENABLE ROW LEVEL SECURITY;

-- Policies für exercises Tabelle
CREATE POLICY "Users can view their own exercises" ON exercises
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercises" ON exercises
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercises" ON exercises
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercises" ON exercises
  FOR DELETE USING (auth.uid() = user_id);

-- Policies für workouts Tabelle
CREATE POLICY "Users can view their own workouts" ON workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workouts" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts" ON workouts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts" ON workouts
  FOR DELETE USING (auth.uid() = user_id);

-- Policies für workout_exercises Tabelle
CREATE POLICY "Users can view their own workout exercises" ON workout_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own workout exercises" ON workout_exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own workout exercises" ON workout_exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own workout exercises" ON workout_exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

-- Policies für user_profiles Tabelle
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies für fitness_goals Tabelle
CREATE POLICY "Users can view their own goals" ON fitness_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" ON fitness_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON fitness_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON fitness_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger-Funktionen für automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger für updated_at in allen relevanten Tabellen
CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON workouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fitness_goals_updated_at BEFORE UPDATE ON fitness_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Beispiel-Daten (optional)
-- Uncomment the following lines if you want to insert sample data

/*
-- Beispiel-Übungen für verschiedene Kategorien
INSERT INTO exercises (user_id, name, category, sets, reps, description) VALUES
  (auth.uid(), 'Liegestütze', 'kraft', 3, 15, 'Klassische Liegestütze für Brust und Arme'),
  (auth.uid(), 'Kniebeugen', 'kraft', 3, 20, 'Bodyweight Squats für die Beine'),
  (auth.uid(), 'Laufen', 'cardio', null, null, 'Ausdauerlauf im Park'),
  (auth.uid(), 'Yoga-Flow', 'flexibilität', null, null, 'Entspannende Yoga-Sequenz');
*/

-- Bestätigung
SELECT 'TrackApp Datenbank-Schema erfolgreich erstellt! 🎉' as message;
