-- Step-by-step approach to diagnose and fix mood constraint
-- Run these queries one by one in Supabase SQL Editor

-- STEP 1: Check what mood values currently exist
SELECT DISTINCT mood, COUNT(*) as count
FROM public.streaks 
GROUP BY mood
ORDER BY count DESC;

-- STEP 2: See some example rows with each mood value
SELECT id, user_id, date, mood, created_at
FROM public.streaks 
WHERE mood IS NOT NULL
ORDER BY mood, created_at DESC
LIMIT 20;

-- STEP 3: Check if there are any NULL mood values
SELECT COUNT(*) as null_mood_count
FROM public.streaks 
WHERE mood IS NULL;

-- STEP 4: See the current constraint definition
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%mood%' OR constraint_name LIKE '%streaks%';

-- STEP 5: If you want to see all constraints on the streaks table
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'streaks' 
    AND tc.table_schema = 'public';
