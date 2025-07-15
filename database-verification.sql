-- 🔍 DATABASE VERIFICATION SCRIPT
-- Run this after the migration to verify everything is working

-- 1. Check profiles table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if friend_code constraint exists
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'profiles' 
AND constraint_type = 'UNIQUE'
AND constraint_name LIKE '%friend_code%';

-- 3. Check existing users and their friend codes
SELECT 
    p.id,
    u.email,
    p.display_name,
    p.friend_code,
    p.created_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

-- 4. Test friend code generation function
SELECT generate_friend_code() as sample_friend_code;

-- 5. Check if triggers exist
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
OR (trigger_schema = 'auth' AND event_object_table = 'users');

-- 6. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('profiles', 'friends_simple', 'streaks');

-- 7. Test if we can insert a test profile (simulating new user registration)
-- Note: This is just a test query - comment out when running
/*
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
BEGIN
    -- Test profile creation
    INSERT INTO public.profiles (id, display_name, friend_code)
    VALUES (
        test_user_id,
        'Test User',
        generate_friend_code()
    );
    
    RAISE NOTICE 'Test profile created successfully with ID: %', test_user_id;
    
    -- Clean up test data
    DELETE FROM public.profiles WHERE id = test_user_id;
    
    RAISE NOTICE 'Test profile cleaned up successfully';
END $$;
*/

SELECT 'Database verification complete! ✅' as result;
