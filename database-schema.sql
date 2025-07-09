-- SICHERE MIGRATION: Neue Streak-Tabellen ohne bestehende Daten zu ändern
-- Dieses Script erstellt nur NEUE Tabellen und lässt die vorhandene exercises-Tabelle unberührt

-- 1. Erstelle Streaks-Tabelle
CREATE TABLE IF NOT EXISTS public.streaks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    sport VARCHAR(50) NOT NULL,
    category VARCHAR(50), -- Body-Part bei Gym, null bei anderen Sportarten
    mood VARCHAR(20) NOT NULL CHECK (mood IN ('gut', 'mittel', 'schlecht')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Eindeutiger Eintrag pro Tag und User
    UNIQUE(user_id, date)
);

-- 2. Erstelle Friendships-Tabelle
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Verhindere doppelte Freundschaftsanfragen
    UNIQUE(user_id, friend_id),
    -- Verhindere Selbst-Freundschaft
    CHECK (user_id != friend_id)
);

-- 3. RLS (Row Level Security) aktivieren
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies für streaks
DROP POLICY IF EXISTS "Users can view own streaks" ON public.streaks;
CREATE POLICY "Users can view own streaks" ON public.streaks
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own streaks" ON public.streaks;
CREATE POLICY "Users can insert own streaks" ON public.streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own streaks" ON public.streaks;
CREATE POLICY "Users can update own streaks" ON public.streaks
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own streaks" ON public.streaks;
CREATE POLICY "Users can delete own streaks" ON public.streaks
    FOR DELETE USING (auth.uid() = user_id);

-- 5. RLS Policies für friendships
DROP POLICY IF EXISTS "Users can view own friendships" ON public.friendships;
CREATE POLICY "Users can view own friendships" ON public.friendships
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

DROP POLICY IF EXISTS "Users can create friendships" ON public.friendships;
CREATE POLICY "Users can create friendships" ON public.friendships
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own friendship requests" ON public.friendships;
CREATE POLICY "Users can update own friendship requests" ON public.friendships
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- 6. Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_streaks_user_date ON public.streaks(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON public.friendships(user_id) WHERE status = 'accepted';
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON public.friendships(friend_id) WHERE status = 'accepted';

-- 7. Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_streaks_updated_at ON public.streaks;
CREATE TRIGGER update_streaks_updated_at 
    BEFORE UPDATE ON public.streaks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. View für aktuelle Streaks mit 3-Tage-Regel
-- Streak geht verloren, wenn mehr als 3 Tage ohne Workout vergehen
CREATE OR REPLACE VIEW user_current_streaks AS
WITH latest_workout AS (
    SELECT 
        user_id,
        MAX(date) as last_workout_date,
        CURRENT_DATE - MAX(date) as days_since_last_workout
    FROM public.streaks
    GROUP BY user_id
),
streak_calculation AS (
    SELECT 
        s.user_id,
        s.date,
        ROW_NUMBER() OVER (PARTITION BY s.user_id ORDER BY s.date DESC) as day_rank,
        CURRENT_DATE - s.date as days_ago
    FROM public.streaks s
    INNER JOIN latest_workout lw ON s.user_id = lw.user_id
    WHERE s.date <= CURRENT_DATE
        AND lw.days_since_last_workout <= 3  -- Nur wenn letztes Workout max. 3 Tage her ist
),
current_streaks AS (
    SELECT 
        user_id,
        COUNT(*) as streak_length
    FROM streak_calculation
    WHERE days_ago = day_rank - 1  -- Aufeinanderfolgende Tage
    GROUP BY user_id
),
all_users AS (
    SELECT DISTINCT user_id FROM public.streaks
)
SELECT 
    au.user_id,
    COALESCE(cs.streak_length, 0) as current_streak
FROM all_users au
LEFT JOIN current_streaks cs ON au.user_id = cs.user_id;

-- 9. Teste die Tabellen (ohne Daten einzufügen)
SELECT 'Streaks table created successfully' as status 
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'streaks');

SELECT 'Friendships table created successfully' as status 
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'friendships');
