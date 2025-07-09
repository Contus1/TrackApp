-- 1. Prüfe, ob Profile für bestehende Benutzer existieren
SELECT u.id, u.email, u.created_at, p.display_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;

-- 2. Erstelle Profile für alle bestehenden Benutzer (falls sie nicht existieren)
INSERT INTO public.profiles (id, display_name)
SELECT 
    u.id,
    COALESCE(
        u.raw_user_meta_data->>'display_name',
        split_part(u.email, '@', 1)
    ) as display_name
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

-- 3. Prüfe nochmals, ob alle Profile erstellt wurden
SELECT u.id, u.email, p.display_name, p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;
