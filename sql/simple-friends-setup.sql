-- Einfacher Test und Setup für Friends-System
-- Führe dieses Script in Supabase SQL Editor aus

-- 1. Prüfe, ob Tabelle existiert
SELECT 
    schemaname, 
    tablename, 
    tableowner 
FROM pg_tables 
WHERE tablename = 'friends';

-- 2. Erstelle Tabelle falls sie nicht existiert (vereinfacht)
CREATE TABLE IF NOT EXISTS public.friends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inviter_id UUID NOT NULL,
    invitee_id UUID,
    invitee_email TEXT,
    invite_token TEXT UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    connected_at TIMESTAMP WITH TIME ZONE
);

-- 3. RLS aktivieren
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- 4. Einfache Policy für Tests
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.friends;
CREATE POLICY "Allow all for authenticated users" ON public.friends
    FOR ALL USING (auth.uid() IS NOT NULL);

-- 5. Token-Generierungs-Funktion (vereinfacht)
CREATE OR REPLACE FUNCTION generate_invite_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Test die Funktion
SELECT generate_invite_token() as test_token;

-- 7. Test die Tabelle
SELECT 
    'Friends table ready!' as status,
    count(*) as current_friends_count
FROM public.friends;

-- 8. Prüfe aktuelle Benutzer (für Tests)
SELECT 
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
