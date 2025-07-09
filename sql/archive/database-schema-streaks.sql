-- Neue Datenbank-Schema für Streak-basierte Fitness-App

-- Tabelle für Streak-Einträge
CREATE TABLE streaks (
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

-- Tabelle für Freundschaften
CREATE TABLE friendships (
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

-- View für aktuelle Streaks (aufeinanderfolgende Tage)
CREATE OR REPLACE VIEW user_current_streaks AS
WITH streak_days AS (
    SELECT 
        user_id,
        date,
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY date DESC) as day_rank,
        date - INTERVAL '1 day' * (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY date DESC) - 1) as streak_group
    FROM streaks
    WHERE date <= CURRENT_DATE
),
current_streaks AS (
    SELECT 
        user_id,
        COUNT(*) as streak_length,
        MAX(date) as last_activity_date
    FROM streak_days
    WHERE streak_group = (
        SELECT MAX(streak_group) 
        FROM streak_days sd2 
        WHERE sd2.user_id = streak_days.user_id 
        AND sd2.date = CURRENT_DATE
    )
    GROUP BY user_id, streak_group
)
SELECT 
    cs.user_id,
    CASE 
        WHEN cs.last_activity_date = CURRENT_DATE THEN cs.streak_length
        ELSE 0
    END as current_streak
FROM current_streaks cs;

-- RLS (Row Level Security) aktivieren
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- RLS Policies für streaks
CREATE POLICY "Users can view own streaks" ON streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks" ON streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON streaks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own streaks" ON streaks
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies für friendships
CREATE POLICY "Users can view own friendships" ON friendships
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendships" ON friendships
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own friendship requests" ON friendships
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Indizes für Performance
CREATE INDEX idx_streaks_user_date ON streaks(user_id, date DESC);
CREATE INDEX idx_friendships_user ON friendships(user_id) WHERE status = 'accepted';
CREATE INDEX idx_friendships_friend ON friendships(friend_id) WHERE status = 'accepted';

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_streaks_updated_at 
    BEFORE UPDATE ON streaks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
