-- Test query für die spezifische Friend ID
SELECT 
    id,
    display_name,
    friend_code,
    created_at
FROM profiles 
WHERE id = '85f7d418-36ec-48e6-a27f-072814bce437';

-- Alle Profile anzeigen um zu sehen was da ist
SELECT 
    id,
    display_name,
    friend_code,
    created_at
FROM profiles 
ORDER BY created_at DESC;

-- Simple friendships für Debug
SELECT * FROM simple_friendships;
