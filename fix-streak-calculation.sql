-- STREAK CALCULATION FIX
-- Run this AFTER your existing SQL scripts
-- This fixes the consecutive day calculation logic

-- This improves your existing user_current_streaks view
-- Your existing structure is good, but the consecutive day logic needs fixing

CREATE OR REPLACE VIEW user_current_streaks AS
WITH latest_workout AS (
    SELECT 
        user_id,
        MAX(date::DATE) as last_workout_date,
        CURRENT_DATE - MAX(date::DATE) as days_since_last_workout
    FROM public.streaks
    GROUP BY user_id
),
daily_workouts AS (
    -- Get unique workout dates per user (one entry per day, regardless of multiple workouts)
    SELECT 
        user_id,
        date::DATE as workout_date
    FROM public.streaks
    GROUP BY user_id, date::DATE
),
consecutive_days AS (
    SELECT 
        dw.user_id,
        dw.workout_date,
        dw.workout_date - INTERVAL '1 day' * (ROW_NUMBER() OVER (PARTITION BY dw.user_id ORDER BY dw.workout_date DESC) - 1) as group_date
    FROM daily_workouts dw
    INNER JOIN latest_workout lw ON dw.user_id = lw.user_id
    WHERE lw.days_since_last_workout <= 3  -- Only if last workout was within 3 days
),
streak_groups AS (
    SELECT 
        cd.user_id,
        cd.group_date,
        COUNT(*) as consecutive_count,
        MAX(cd.workout_date) as latest_in_group
    FROM consecutive_days cd
    GROUP BY cd.user_id, cd.group_date
),
current_streaks AS (
    SELECT 
        sg.user_id,
        MAX(sg.consecutive_count) as current_streak
    FROM streak_groups sg
    INNER JOIN latest_workout lw ON sg.user_id = lw.user_id
    WHERE sg.latest_in_group = lw.last_workout_date  -- Only the group containing the latest workout
    GROUP BY sg.user_id
),
all_users AS (
    SELECT DISTINCT user_id FROM public.streaks
)
SELECT 
    au.user_id,
    COALESCE(cs.current_streak, 0) as current_streak,
    lw.last_workout_date,
    COALESCE(lw.days_since_last_workout, 999) as days_since_last_activity
FROM all_users au
LEFT JOIN current_streaks cs ON au.user_id = cs.user_id
LEFT JOIN latest_workout lw ON au.user_id = lw.user_id;

-- Update friends_simple view to use the corrected streak calculation
DROP VIEW IF EXISTS friends_simple;

CREATE VIEW friends_simple AS
SELECT 
    sf.user_id,
    sf.friend_id,
    p.display_name as friend_name,
    p.avatar_url as friend_avatar,
    p.friend_code,
    COALESCE(ucs.current_streak, 0) as friend_streak,
    sf.created_at as friendship_created
FROM simple_friendships sf
JOIN profiles p ON sf.friend_id = p.id
LEFT JOIN user_current_streaks ucs ON p.id = ucs.user_id;

-- Test the fix
SELECT 'STREAK CALCULATION FIXED! ✅' as status;
SELECT 'Rules: 1 activity/day = 1 flame, 3-day grace period' as rules;

-- Test your streak
SELECT 
    current_streak,
    days_since_last_activity,
    CASE 
        WHEN days_since_last_activity <= 3 THEN '✅ Active'
        ELSE '❌ Streak broken'
    END as status
FROM user_current_streaks 
WHERE user_id = auth.uid();
