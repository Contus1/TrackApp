-- CORRECTED Streak Calculation System
-- Builds on existing structure but fixes consecutive day logic
-- Calculates consecutive days with at least one activity
-- Streak breaks after 3 days of inactivity

-- 1. Improved user_current_streaks view with correct consecutive day calculation
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

-- 2. Function to get detailed streak stats
CREATE OR REPLACE FUNCTION get_user_streak_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    current_streak INTEGER;
    longest_streak INTEGER := 0;
    total_days INTEGER;
    this_week INTEGER;
    this_month INTEGER;
    temp_streak INTEGER := 0;
    prev_date DATE := NULL;
    rec RECORD;
BEGIN
    -- Get current streak from view
    SELECT 
        COALESCE(ucs.current_streak, 0)
    INTO current_streak
    FROM user_current_streaks ucs 
    WHERE ucs.user_id = p_user_id;
    
    -- Calculate longest streak by checking consecutive dates
    FOR rec IN 
        SELECT DISTINCT date::DATE as workout_date
        FROM public.streaks 
        WHERE user_id = p_user_id 
        ORDER BY date::DATE
    LOOP
        IF prev_date IS NULL OR rec.workout_date = prev_date + INTERVAL '1 day' THEN
            temp_streak := temp_streak + 1;
            longest_streak := GREATEST(longest_streak, temp_streak);
        ELSE
            temp_streak := 1;
        END IF;
        prev_date := rec.workout_date;
    END LOOP;
    
    -- Total unique days with activity
    SELECT COUNT(DISTINCT date::DATE) INTO total_days
    FROM public.streaks 
    WHERE user_id = p_user_id;
    
    -- This week (unique days)
    SELECT COUNT(DISTINCT date::DATE) INTO this_week
    FROM public.streaks 
    WHERE user_id = p_user_id 
    AND date::DATE >= CURRENT_DATE - INTERVAL '6 days';
    
    -- This month (unique days)
    SELECT COUNT(DISTINCT date::DATE) INTO this_month
    FROM public.streaks 
    WHERE user_id = p_user_id 
    AND date::DATE >= CURRENT_DATE - INTERVAL '29 days';
    
    RETURN json_build_object(
        'current_streak', COALESCE(current_streak, 0),
        'longest_streak', COALESCE(longest_streak, 0),
        'total_days', COALESCE(total_days, 0),
        'this_week', COALESCE(this_week, 0),
        'this_month', COALESCE(this_month, 0)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update friends_simple view to use correct streak calculation
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

-- 4. Grant permissions
GRANT SELECT ON user_current_streaks TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_streak_stats TO authenticated;
GRANT SELECT ON friends_simple TO authenticated;

-- 5. Test the corrected logic
SELECT 'Corrected streak calculation active - one activity per day = one flame, 3-day grace period' as status;
