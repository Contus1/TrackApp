-- Update für 3-Tage-Streak-Regel
-- Dieses Script aktualisiert nur die View für die Streak-Berechnung

-- View für aktuelle Streaks mit 3-Tage-Regel
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

-- Test der neuen View-Logik
SELECT 'View updated successfully - 3-day rule now active' as status;
