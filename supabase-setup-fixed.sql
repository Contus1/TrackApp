-- Korrigierte Version - lösche die alte Tabelle und erstelle sie neu
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. Erstelle die profiles Tabelle korrekt
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Erstelle eine Funktion, die automatisch ein Profil erstellt
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Erstelle den Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Erstelle eine Funktion zum Aktualisieren des 'updated_at' Felds
CREATE OR REPLACE FUNCTION update_updated_at_column() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Erstelle den Update-Trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Setze RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 7. Lösche alte Policies und erstelle neue
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

-- Erstelle neue Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can create own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- 8. Erstelle eine Funktion zum Löschen von Benutzerdaten
CREATE OR REPLACE FUNCTION delete_user_data() 
RETURNS void AS $$
BEGIN
  DELETE FROM public.streaks WHERE user_id = auth.uid();
  DELETE FROM public.friends WHERE inviter_id = auth.uid() OR invitee_id = auth.uid();
  DELETE FROM public.profiles WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Erstelle einen Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);

-- 10. Gebe Berechtigungen
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 11. Erstelle Profile für alle bestehenden Benutzer
INSERT INTO public.profiles (id, display_name)
SELECT 
    u.id,
    COALESCE(
        u.raw_user_meta_data->>'display_name',
        split_part(u.email, '@', 1)
    ) as display_name
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

-- 12. Prüfe das Ergebnis
SELECT u.id, u.email, p.display_name, p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;
