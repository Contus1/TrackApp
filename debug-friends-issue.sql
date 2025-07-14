-- Debug query to check for duplicate friendships and missing display names

-- 1. Check for duplicate friendships
SELECT user_id, friend_id, COUNT(*) as count
FROM simple_friendships 
GROUP BY user_id, friend_id 
HAVING COUNT(*) > 1;

-- 2. Check all friendships
SELECT * FROM simple_friendships ORDER BY created_at DESC;

-- 3. Check profiles without display names
SELECT id, display_name, friend_code, created_at 
FROM profiles 
WHERE display_name IS NULL OR display_name = '';

-- 4. Check all profiles with friend codes
SELECT id, display_name, friend_code, created_at 
FROM profiles 
WHERE friend_code IS NOT NULL
ORDER BY created_at DESC;

-- 5. Check if there are entries in the old friends table
SELECT COUNT(*) as old_friends_count FROM friends;

-- 6. DETAILED: Check what's in the old friends table
SELECT * FROM friends ORDER BY created_at DESC LIMIT 10;

-- 7. Check if dashboard is accidentally loading from old friends table
-- (This would explain the "Friend" names and duplicates)
