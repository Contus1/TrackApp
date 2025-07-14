-- 🚀 SIMPLE FRIENDS SYSTEM - Supabase Setup
-- Führe diese Queries in deinem Supabase SQL Editor aus

-- 1. Add friend_code column to profiles table
ALTER TABLE profiles 
ADD COLUMN friend_code VARCHAR(6) UNIQUE;

-- 2. Create function to generate unique friend codes
CREATE OR REPLACE FUNCTION generate_friend_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        -- Generate 6 character code (2 letters + 4 numbers)
        code := UPPER(
            CHR(65 + FLOOR(RANDOM() * 26)::INT) ||
            CHR(65 + FLOOR(RANDOM() * 26)::INT) ||
            LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')
        );
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM profiles WHERE friend_code = code) INTO exists_check;
        
        -- If code doesn't exist, return it
        IF NOT exists_check THEN
            RETURN code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 3. Update existing users with friend codes
UPDATE profiles 
SET friend_code = generate_friend_code() 
WHERE friend_code IS NULL;

-- 4. Create trigger to auto-generate friend codes for new users
CREATE OR REPLACE FUNCTION auto_generate_friend_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.friend_code IS NULL THEN
        NEW.friend_code := generate_friend_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_friend_code
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_friend_code();

-- 5. Create simple friendships table
CREATE TABLE IF NOT EXISTS simple_friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

-- 6. Create RLS policies
ALTER TABLE simple_friendships ENABLE ROW LEVEL SECURITY;

-- Users can see their own friendships
CREATE POLICY "Users can see own friendships" ON simple_friendships
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can create friendships for themselves
CREATE POLICY "Users can create friendships" ON simple_friendships
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own friendships
CREATE POLICY "Users can delete friendships" ON simple_friendships
    FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- 7. Function to add friend by code
CREATE OR REPLACE FUNCTION add_friend_by_code(friend_code_input TEXT)
RETURNS JSON AS $$
DECLARE
    current_user_id UUID;
    friend_user_id UUID;
    friend_profile RECORD;
    result JSON;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN JSON_BUILD_OBJECT('success', false, 'error', 'Not authenticated');
    END IF;
    
    -- Find friend by code
    SELECT id, display_name, avatar_url INTO friend_profile
    FROM profiles 
    WHERE friend_code = UPPER(friend_code_input);
    
    IF friend_profile.id IS NULL THEN
        RETURN JSON_BUILD_OBJECT('success', false, 'error', 'Friend code not found');
    END IF;
    
    -- Can't add yourself
    IF friend_profile.id = current_user_id THEN
        RETURN JSON_BUILD_OBJECT('success', false, 'error', 'Cannot add yourself as friend');
    END IF;
    
    -- Check if already friends
    IF EXISTS(
        SELECT 1 FROM simple_friendships 
        WHERE (user_id = current_user_id AND friend_id = friend_profile.id)
        OR (user_id = friend_profile.id AND friend_id = current_user_id)
    ) THEN
        RETURN JSON_BUILD_OBJECT('success', false, 'error', 'Already friends');
    END IF;
    
    -- Add bidirectional friendship
    INSERT INTO simple_friendships (user_id, friend_id) VALUES 
        (current_user_id, friend_profile.id),
        (friend_profile.id, current_user_id);
    
    RETURN JSON_BUILD_OBJECT(
        'success', true, 
        'friend', JSON_BUILD_OBJECT(
            'id', friend_profile.id,
            'name', friend_profile.display_name,
            'avatar', friend_profile.avatar_url
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. View for friends with profiles and streaks
CREATE OR REPLACE VIEW friends_simple AS
SELECT 
    sf.user_id,
    p.id as friend_id,
    p.display_name as friend_name,
    p.avatar_url as friend_avatar,
    p.friend_code,
    COALESCE(streak_data.current_streak, 0) as friend_streak,
    sf.created_at as friendship_created
FROM simple_friendships sf
JOIN profiles p ON sf.friend_id = p.id
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as current_streak
    FROM streaks 
    WHERE date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY user_id
) streak_data ON p.id = streak_data.user_id;

-- 9. Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON friends_simple TO authenticated;
GRANT EXECUTE ON FUNCTION add_friend_by_code TO authenticated;
GRANT SELECT ON profiles TO authenticated;

-- 10. Test the setup
SELECT 'Setup complete! Test your friend codes:' as status;
SELECT id, display_name, friend_code FROM profiles LIMIT 5;
