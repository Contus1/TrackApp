-- Friends System Setup for Supabase
-- Run this in your Supabase SQL Editor

-- 1. Create the friends table
CREATE TABLE IF NOT EXISTS public.friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inviter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invitee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT,
  invite_token TEXT UNIQUE,
  status TEXT CHECK (status IN ('pending', 'connected', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  connected_at TIMESTAMP WITH TIME ZONE,
  
  -- Ensure either invitee_id or invitee_email is provided
  CONSTRAINT friends_invitee_check CHECK (
    (invitee_id IS NOT NULL AND invitee_email IS NULL) OR 
    (invitee_id IS NULL AND invitee_email IS NOT NULL)
  ),
  
  -- Prevent self-friendship
  CONSTRAINT friends_no_self_friendship CHECK (inviter_id != invitee_id),
  
  -- Prevent duplicate friendships
  CONSTRAINT friends_unique_relationship UNIQUE (inviter_id, invitee_id),
  CONSTRAINT friends_unique_email_invitation UNIQUE (inviter_id, invitee_email)
);

-- 2. Enable Row Level Security
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for the friends table

-- Users can view friendships where they are involved
CREATE POLICY "Users can view own friendships" ON public.friends
  FOR SELECT USING (
    auth.uid() = inviter_id OR 
    auth.uid() = invitee_id
  );

-- Users can create friend invitations (as inviter)
CREATE POLICY "Users can create friend invitations" ON public.friends
  FOR INSERT WITH CHECK (auth.uid() = inviter_id);

-- Users can update friendships where they are the invitee (to accept/decline)
CREATE POLICY "Users can update friendships as invitee" ON public.friends
  FOR UPDATE USING (auth.uid() = invitee_id);

-- Users can delete friendships where they are involved
CREATE POLICY "Users can delete own friendships" ON public.friends
  FOR DELETE USING (
    auth.uid() = inviter_id OR 
    auth.uid() = invitee_id
  );

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_friends_inviter_id ON public.friends(inviter_id);
CREATE INDEX IF NOT EXISTS idx_friends_invitee_id ON public.friends(invitee_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON public.friends(status);
CREATE INDEX IF NOT EXISTS idx_friends_invite_token ON public.friends(invite_token);

-- 5. Create a function to generate invite tokens
CREATE OR REPLACE FUNCTION public.generate_invite_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create a function to automatically set connected_at when status becomes 'connected'
CREATE OR REPLACE FUNCTION public.update_friends_connected_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'connected' AND OLD.status != 'connected' THEN
    NEW.connected_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for connected_at updates
DROP TRIGGER IF EXISTS trigger_friends_connected_at ON public.friends;
CREATE TRIGGER trigger_friends_connected_at
  BEFORE UPDATE ON public.friends
  FOR EACH ROW
  EXECUTE FUNCTION public.update_friends_connected_at();

-- 8. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.friends TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 9. Create a view for easier friend queries with user details
CREATE OR REPLACE VIEW public.friends_with_profiles AS
SELECT 
  f.id,
  f.inviter_id,
  f.invitee_id,
  f.invitee_email,
  f.status,
  f.created_at,
  f.connected_at,
  p1.display_name as inviter_name,
  p1.avatar_url as inviter_avatar,
  p2.display_name as invitee_name,
  p2.avatar_url as invitee_avatar
FROM public.friends f
LEFT JOIN public.profiles p1 ON f.inviter_id = p1.id
LEFT JOIN public.profiles p2 ON f.invitee_id = p2.id;

-- 10. Grant access to the view
GRANT SELECT ON public.friends_with_profiles TO authenticated;

-- 11. Verify the setup
SELECT 'Friends table created successfully' as message;

-- Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'friends' 
AND table_schema = 'public'
ORDER BY ordinal_position;
