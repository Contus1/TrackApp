-- Lösung: Erlaube mehrere Trainings pro Tag
-- Führe dieses Script in deinem Supabase SQL Editor aus

-- 1. Entferne die UNIQUE-Constraint für (user_id, date)
ALTER TABLE public.streaks 
DROP CONSTRAINT IF EXISTS streaks_user_id_date_key;

-- 2. Erstelle neue UNIQUE-Constraint die Zeit mit einbezieht
-- So können mehrere Trainings pro Tag gespeichert werden
ALTER TABLE public.streaks 
ADD CONSTRAINT streaks_user_id_datetime_key 
UNIQUE (user_id, date, created_at);

-- 3. Prüfe ob die Änderung funktioniert hat
SELECT 
    constraint_name, 
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'streaks' 
AND constraint_type = 'UNIQUE';
