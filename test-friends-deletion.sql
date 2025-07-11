-- Test Friend Removal Functionality
-- Run these queries in Supabase SQL Editor to test the friend deletion

-- 1. First, check what friend relationships exist
SELECT 
    id,
    inviter_id,
    invitee_id,
    invitee_email,
    status,
    created_at
FROM public.friends
WHERE status = 'connected'
ORDER BY created_at DESC;

-- 2. Test the deletion query that your app will use
-- Replace 'USER_ID_1' and 'USER_ID_2' with actual UUIDs from your database

-- This is what the app does - delete both directions:
-- DELETE FROM public.friends WHERE inviter_id = 'USER_ID_1' AND invitee_id = 'USER_ID_2';
-- DELETE FROM public.friends WHERE inviter_id = 'USER_ID_2' AND invitee_id = 'USER_ID_1';

-- 3. Check if the deletion worked
SELECT 
    id,
    inviter_id,
    invitee_id,
    status,
    'After deletion' as note
FROM public.friends
WHERE (inviter_id = 'USER_ID_1' AND invitee_id = 'USER_ID_2')
   OR (inviter_id = 'USER_ID_2' AND invitee_id = 'USER_ID_1');

-- 4. Verify RLS policies are working
-- This should only show friendships where the current user is involved
SELECT * FROM public.friends WHERE auth.uid() = inviter_id OR auth.uid() = invitee_id;

-- 5. Test the friends view
SELECT * FROM public.friends_with_profiles 
WHERE status = 'connected'
LIMIT 5;
