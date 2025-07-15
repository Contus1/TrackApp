-- 🧹 SUPABASE CLEANUP SCRIPT - TrackApp
-- This removes unused tables and keeps only what TrackApp actually needs
-- BACKUP YOUR DATA FIRST if any of these tables contain important data!

-- 1. Drop unused tables (comment out any you want to keep)
DROP TABLE IF EXISTS public.birthdays CASCADE;
DROP TABLE IF EXISTS public.exported_birthdays CASCADE;
DROP TABLE IF EXISTS public.group_birthdays CASCADE;
DROP TABLE IF EXISTS public.group_invites CASCADE;
DROP TABLE IF EXISTS public.groups CASCADE;
DROP TABLE IF EXISTS public.invites CASCADE;

-- 2. Keep only TrackApp tables:
-- - profiles (user profiles with friend codes)
-- - friends_simple (friends relationships)  
-- - streaks (workout tracking)

-- 3. Clean up any orphaned data in remaining tables
DELETE FROM public.friends_simple WHERE user_id NOT IN (SELECT id FROM auth.users);
DELETE FROM public.friends_simple WHERE friend_id NOT IN (SELECT id FROM auth.users);
DELETE FROM public.streaks WHERE user_id NOT IN (SELECT id FROM auth.users);
DELETE FROM public.profiles WHERE id NOT IN (SELECT id FROM auth.users);

-- 4. Ensure all existing users have friend codes
UPDATE public.profiles 
SET friend_code = UPPER(CHR(65 + FLOOR(RANDOM() * 26)::INT) || CHR(65 + FLOOR(RANDOM() * 26)::INT) || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'))
WHERE friend_code IS NULL;

-- 5. Add any missing constraints
ALTER TABLE public.profiles ADD CONSTRAINT profiles_friend_code_unique UNIQUE (friend_code);
ALTER TABLE public.friends_simple ADD CONSTRAINT friends_simple_user_friend_unique UNIQUE (user_id, friend_id);
ALTER TABLE public.streaks ADD CONSTRAINT streaks_user_date_type_unique UNIQUE (user_id, date, type);

-- 6. Verify final state
SELECT 'Cleanup complete!' as status;

-- Show remaining tables
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;

-- Show user count and friend code status
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN friend_code IS NOT NULL THEN 1 END) as users_with_friend_codes,
    COUNT(CASE WHEN friend_code IS NULL THEN 1 END) as users_without_friend_codes
FROM public.profiles;
