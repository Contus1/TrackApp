-- Test-Invite für den Invite-Flow
-- Erstelle einen Test-User und einen Test-Invite-Token

-- Erstelle Test-User falls nicht vorhanden
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test@example.com',
  '$2a$10$dummyhashedpassword',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Erstelle entsprechenden Eintrag in public.users
INSERT INTO public.users (id, email, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test@example.com',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Erstelle Test-Invite-Token
INSERT INTO public.friends (
  inviter_id,
  invite_token,
  status,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'ab8519f86833ac7fbecd8dd4371048d6',
  'pending',
  NOW()
) ON CONFLICT (invite_token) DO NOTHING;
