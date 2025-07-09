-- Erweiterte Friends-Tabelle mit Deep Link Support
-- Ersetzt/erweitert die bestehende friendships-Tabelle

-- 1. Neue Friends-Tabelle (kompatibel mit bestehender friendships)
CREATE TABLE IF NOT EXISTS public.friends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invitee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    invitee_email TEXT, -- Für Einladungen vor Registrierung
    invite_token TEXT UNIQUE, -- Deep Link Token
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    connected_at TIMESTAMP WITH TIME ZONE,
    
    -- Verhindere doppelte Einladungen
    UNIQUE(inviter_id, invitee_email),
    UNIQUE(inviter_id, invitee_id),
    -- Verhindere Selbst-Einladung
    CHECK (inviter_id != invitee_id)
);

-- 2. RLS aktivieren
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Users can view own friends" ON public.friends;
CREATE POLICY "Users can view own friends" ON public.friends
    FOR SELECT USING (
        auth.uid() = inviter_id OR 
        auth.uid() = invitee_id OR
        invite_token IS NOT NULL -- Für Deep Link Access
    );

DROP POLICY IF EXISTS "Users can create friend invites" ON public.friends;
CREATE POLICY "Users can create friend invites" ON public.friends
    FOR INSERT WITH CHECK (auth.uid() = inviter_id);

DROP POLICY IF EXISTS "Users can update friend status" ON public.friends;
CREATE POLICY "Users can update friend status" ON public.friends
    FOR UPDATE USING (
        auth.uid() = inviter_id OR 
        auth.uid() = invitee_id
    );

-- 4. Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_friends_inviter ON public.friends(inviter_id) WHERE status = 'connected';
CREATE INDEX IF NOT EXISTS idx_friends_invitee ON public.friends(invitee_id) WHERE status = 'connected';
CREATE INDEX IF NOT EXISTS idx_friends_token ON public.friends(invite_token) WHERE status = 'pending';

-- 5. View für Connected Friends mit Streaks
CREATE OR REPLACE VIEW friends_with_streaks AS
WITH user_friends AS (
    -- Alle Freunde eines Users (beidseitig)
    SELECT 
        f.inviter_id as user_id,
        f.invitee_id as friend_id,
        f.status,
        f.connected_at
    FROM public.friends f
    WHERE f.status = 'connected' AND f.invitee_id IS NOT NULL
    
    UNION ALL
    
    SELECT 
        f.invitee_id as user_id,
        f.inviter_id as friend_id,
        f.status,
        f.connected_at
    FROM public.friends f
    WHERE f.status = 'connected' AND f.invitee_id IS NOT NULL
)
SELECT 
    uf.user_id,
    uf.friend_id,
    u.email as friend_email,
    COALESCE(u.raw_user_meta_data->>'name', u.email) as friend_name,
    COALESCE(u.raw_user_meta_data->>'avatar_url', '') as friend_avatar,
    COALESCE(ucs.current_streak, 0) as friend_streak,
    uf.connected_at
FROM user_friends uf
LEFT JOIN auth.users u ON u.id = uf.friend_id
LEFT JOIN user_current_streaks ucs ON ucs.user_id = uf.friend_id
ORDER BY uf.connected_at DESC;

-- 6. Funktion für Deep Link Token Generation
CREATE OR REPLACE FUNCTION generate_invite_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test
SELECT 'Friends table with deep links created successfully' as status;
