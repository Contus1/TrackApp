-- Test script to verify friend deletion works correctly
-- Run this in Supabase SQL Editor to check the friends table structure and test deletion

-- 1. Check the current friends table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'friends' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check current friend relationships (replace with actual user IDs)
SELECT 
    id,
    inviter_id,
    invitee_id,
    invitee_email,
    status,
    created_at
FROM public.friends
ORDER BY created_at DESC
LIMIT 10;

-- 3. Test deletion query (replace USER_ID_1 and USER_ID_2 with actual UUIDs)
-- This shows what records would be deleted
SELECT 
    id,
    inviter_id,
    invitee_id,
    status,
    'Would be deleted' as action
FROM public.friends
WHERE (inviter_id = 'USER_ID_1' AND invitee_id = 'USER_ID_2')
   OR (inviter_id = 'USER_ID_2' AND invitee_id = 'USER_ID_1');

-- 4. Check for any constraints or triggers on the friends table
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'friends' 
    AND tc.table_schema = 'public';

-- 5. Check for any foreign key relationships
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'friends';
