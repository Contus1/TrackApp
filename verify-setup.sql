-- Prüfe, ob die profiles Tabelle erstellt wurde
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Prüfe, ob die Funktionen erstellt wurden
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('handle_new_user', 'update_updated_at_column', 'delete_user_data');

-- Prüfe, ob die Policies erstellt wurden
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';

-- Prüfe, ob die Trigger erstellt wurden
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name IN ('on_auth_user_created', 'update_profiles_updated_at');
