-- 🔧 COMPLETE DATABASE MIGRATION - TrackApp
-- This file consolidates all necessary database setup and fixes the registration error
-- Run this in your Supabase SQL Editor

-- 1. First, let's make sure we have the base profiles table structure
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Add friend_code column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='friend_code') THEN
        ALTER TABLE profiles ADD COLUMN friend_code VARCHAR(6) UNIQUE;
    END IF;
END $$;

-- 3. Create function to generate unique friend codes
CREATE OR REPLACE FUNCTION generate_friend_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        -- Generate 6 character code (2 letters + 4 numbers)
        code := UPPER(
            CHR(65 + FLOOR(RANDOM() * 26)::INT) ||
            CHR(65 + FLOOR(RANDOM() * 26)::INT) ||
            LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')
        );
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM profiles WHERE friend_code = code) INTO exists_check;
        
        -- If code doesn't exist, return it
        IF NOT exists_check THEN
            RETURN code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 4. Update existing users with friend codes if they don't have one
UPDATE profiles 
SET friend_code = generate_friend_code() 
WHERE friend_code IS NULL;

-- 5. Create or replace the new user handler that includes friend code generation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, friend_code)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    generate_friend_code()
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and still return NEW to avoid blocking user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create the auth trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Create function for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create the update trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 10. Drop old policies and create new ones
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

-- Create new policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can create own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- 11. Create friends tables if they don't exist
CREATE TABLE IF NOT EXISTS public.friends_simple (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_name TEXT,
  friend_avatar TEXT,
  friend_code TEXT,
  friend_streak INTEGER DEFAULT 0,
  friendship_created TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, friend_id)
);

-- 12. Enable RLS for friends_simple
ALTER TABLE public.friends_simple ENABLE ROW LEVEL SECURITY;

-- Create policies for friends_simple
DROP POLICY IF EXISTS "Users can view own friends" ON public.friends_simple;
DROP POLICY IF EXISTS "Users can manage own friends" ON public.friends_simple;

CREATE POLICY "Users can view own friends" ON public.friends_simple
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own friends" ON public.friends_simple
  FOR ALL USING (auth.uid() = user_id);

-- 13. Create workout streaks table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, date, type)
);

-- 14. Enable RLS for streaks
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

-- Create policies for streaks
DROP POLICY IF EXISTS "Users can view own streaks" ON public.streaks;
DROP POLICY IF EXISTS "Users can manage own streaks" ON public.streaks;

CREATE POLICY "Users can view own streaks" ON public.streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own streaks" ON public.streaks
  FOR ALL USING (auth.uid() = user_id);

-- 15. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_friend_code ON public.profiles(friend_code);
CREATE INDEX IF NOT EXISTS idx_friends_simple_user_id ON public.friends_simple(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_simple_friend_id ON public.friends_simple(friend_id);
CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON public.streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_date ON public.streaks(date);

-- 16. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.friends_simple TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.streaks TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 17. Create profiles for any existing users that don't have them
INSERT INTO public.profiles (id, display_name, friend_code)
SELECT 
    u.id,
    COALESCE(
        u.raw_user_meta_data->>'display_name',
        split_part(u.email, '@', 1)
    ) as display_name,
    generate_friend_code()
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- 18. Final verification query
SELECT 
    'Database setup complete!' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN friend_code IS NOT NULL THEN 1 END) as users_with_friend_codes
FROM public.profiles;
