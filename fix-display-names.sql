-- 🏷️ UPDATE DISPLAY NAMES FOR PROFILES

-- 1. Zuerst schauen wir, welche Profile keine display_name haben
SELECT 
    p.id,
    p.display_name,
    p.friend_code,
    au.email,
    au.created_at
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.display_name IS NULL OR p.display_name = ''
ORDER BY au.created_at DESC;

-- 2. Update display_name basierend auf Email (vor dem @)
UPDATE profiles 
SET display_name = SPLIT_PART(
    (SELECT email FROM auth.users WHERE auth.users.id = profiles.id), 
    '@', 1
)
WHERE (display_name IS NULL OR display_name = '')
AND id IN (SELECT id FROM auth.users);

-- 3. Verifiziere die Updates
SELECT 
    p.id,
    p.display_name,
    p.friend_code,
    au.email
FROM profiles p
JOIN auth.users au ON p.id = au.id
ORDER BY au.created_at DESC;

-- 4. Falls noch leere Namen existieren, setze Fallback
UPDATE profiles 
SET display_name = 'User ' || SUBSTRING(friend_code, 1, 4)
WHERE (display_name IS NULL OR display_name = '')
AND friend_code IS NOT NULL;
