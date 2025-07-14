-- 🧹 CLEANUP OLD FRIENDS TABLE DATA

-- WARNING: This will DELETE all data from the old friends table!
-- Make sure you've migrated your friend relationships to simple_friendships first!

-- 1. First, let's see what users need their friendships migrated
SELECT DISTINCT 
    f.user_id,
    f.friend_id,
    p1.display_name as user_name,
    p1.friend_code as user_code,
    p2.display_name as friend_name,
    p2.friend_code as friend_code
FROM friends f
LEFT JOIN profiles p1 ON f.user_id = p1.id
LEFT JOIN profiles p2 ON f.friend_id = p2.id
WHERE f.status = 'accepted'
ORDER BY f.created_at DESC;

-- 2. Check if these friendships already exist in simple_friendships
SELECT 
    sf.user_id,
    sf.friend_id,
    p1.display_name as user_name,
    p2.display_name as friend_name
FROM simple_friendships sf
LEFT JOIN profiles p1 ON sf.user_id = p1.id  
LEFT JOIN profiles p2 ON sf.friend_id = p2.id
ORDER BY sf.created_at DESC;

-- 3. DANGER ZONE: Delete old friends table data
-- Uncomment the following line ONLY after confirming your data is safe:
-- DELETE FROM friends;

-- 4. Alternative: Just remove non-accepted friendships first
DELETE FROM friends WHERE status != 'accepted';

-- 5. Count remaining entries
SELECT COUNT(*) as remaining_friends FROM friends;
