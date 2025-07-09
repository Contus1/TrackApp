-- Test-Script für 3-Tage-Streak-Regel
-- Dieses Script erstellt Test-Daten um die neue Regel zu demonstrieren

-- Hinweis: Dieses Script sollte nur zu Testzwecken verwendet werden!
-- In einer Produktionsumgebung sollten echte User-Daten verwendet werden.

-- Test 1: Benutzer mit aktuellem Streak (heute trainiert)
-- Dieser User sollte seinen Streak behalten
DO $$
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Lösche alte Test-Daten falls vorhanden
    DELETE FROM public.streaks WHERE user_id = test_user_id;
    
    -- Erstelle Streak-Daten für die letzten 5 Tage
    INSERT INTO public.streaks (user_id, date, sport, mood) VALUES
    (test_user_id, CURRENT_DATE - INTERVAL '4 days', 'Gym', 'gut'),
    (test_user_id, CURRENT_DATE - INTERVAL '3 days', 'Gym', 'gut'),
    (test_user_id, CURRENT_DATE - INTERVAL '2 days', 'Laufen', 'mittel'),
    (test_user_id, CURRENT_DATE - INTERVAL '1 day', 'Gym', 'gut'),
    (test_user_id, CURRENT_DATE, 'Yoga', 'gut');
    
    RAISE NOTICE 'Test User 1 erstellt: Sollte Streak von 5 haben';
END $$;

-- Test 2: Benutzer der vor 3 Tagen aufgehört hat
-- Dieser User sollte noch seinen Streak haben (Grenzfall)
DO $$
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000002';
BEGIN
    DELETE FROM public.streaks WHERE user_id = test_user_id;
    
    INSERT INTO public.streaks (user_id, date, sport, mood) VALUES
    (test_user_id, CURRENT_DATE - INTERVAL '6 days', 'Gym', 'gut'),
    (test_user_id, CURRENT_DATE - INTERVAL '5 days', 'Gym', 'gut'),
    (test_user_id, CURRENT_DATE - INTERVAL '4 days', 'Laufen', 'mittel'),
    (test_user_id, CURRENT_DATE - INTERVAL '3 days', 'Gym', 'gut');
    
    RAISE NOTICE 'Test User 2 erstellt: Sollte Streak von 4 haben (vor 3 Tagen letztes Workout)';
END $$;

-- Test 3: Benutzer der vor 4 Tagen aufgehört hat
-- Dieser User sollte seinen Streak verloren haben
DO $$
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000003';
BEGIN
    DELETE FROM public.streaks WHERE user_id = test_user_id;
    
    INSERT INTO public.streaks (user_id, date, sport, mood) VALUES
    (test_user_id, CURRENT_DATE - INTERVAL '7 days', 'Gym', 'gut'),
    (test_user_id, CURRENT_DATE - INTERVAL '6 days', 'Gym', 'gut'),
    (test_user_id, CURRENT_DATE - INTERVAL '5 days', 'Laufen', 'mittel'),
    (test_user_id, CURRENT_DATE - INTERVAL '4 days', 'Gym', 'gut');
    
    RAISE NOTICE 'Test User 3 erstellt: Sollte Streak von 0 haben (vor 4 Tagen letztes Workout)';
END $$;

-- Test 4: Benutzer mit längerer Pause
-- Dieser User sollte definitiv keinen Streak haben
DO $$
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000004';
BEGIN
    DELETE FROM public.streaks WHERE user_id = test_user_id;
    
    INSERT INTO public.streaks (user_id, date, sport, mood) VALUES
    (test_user_id, CURRENT_DATE - INTERVAL '10 days', 'Gym', 'gut'),
    (test_user_id, CURRENT_DATE - INTERVAL '9 days', 'Gym', 'gut'),
    (test_user_id, CURRENT_DATE - INTERVAL '8 days', 'Laufen', 'mittel');
    
    RAISE NOTICE 'Test User 4 erstellt: Sollte Streak von 0 haben (vor 8 Tagen letztes Workout)';
END $$;

-- Teste die Ergebnisse
SELECT 
    '00000000-0000-0000-0000-000000000001' as test_user,
    'Aktueller Streak (heute trainiert)' as scenario,
    current_streak,
    CASE 
        WHEN current_streak = 5 THEN '✅ KORREKT'
        ELSE '❌ FEHLER - erwartet: 5'
    END as result
FROM user_current_streaks 
WHERE user_id = '00000000-0000-0000-0000-000000000001'

UNION ALL

SELECT 
    '00000000-0000-0000-0000-000000000002' as test_user,
    'Vor 3 Tagen letztes Workout' as scenario,
    current_streak,
    CASE 
        WHEN current_streak = 4 THEN '✅ KORREKT'
        ELSE '❌ FEHLER - erwartet: 4'
    END as result
FROM user_current_streaks 
WHERE user_id = '00000000-0000-0000-0000-000000000002'

UNION ALL

SELECT 
    '00000000-0000-0000-0000-000000000003' as test_user,
    'Vor 4 Tagen letztes Workout' as scenario,
    COALESCE(current_streak, 0) as current_streak,
    CASE 
        WHEN COALESCE(current_streak, 0) = 0 THEN '✅ KORREKT'
        ELSE '❌ FEHLER - erwartet: 0'
    END as result
FROM (
    SELECT '00000000-0000-0000-0000-000000000003'::uuid as user_id
) dummy
LEFT JOIN user_current_streaks ON user_current_streaks.user_id = dummy.user_id

UNION ALL

SELECT 
    '00000000-0000-0000-0000-000000000004' as test_user,
    'Vor 8 Tagen letztes Workout' as scenario,
    COALESCE(current_streak, 0) as current_streak,
    CASE 
        WHEN COALESCE(current_streak, 0) = 0 THEN '✅ KORREKT'
        ELSE '❌ FEHLER - erwartet: 0'
    END as result
FROM (
    SELECT '00000000-0000-0000-0000-000000000004'::uuid as user_id
) dummy
LEFT JOIN user_current_streaks ON user_current_streaks.user_id = dummy.user_id;

-- Aufräumen der Test-Daten
-- Entkommentiere die nächsten Zeilen um die Test-Daten zu löschen
/*
DELETE FROM public.streaks WHERE user_id IN (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000004'
);
*/

SELECT 'Test-Daten erstellt. View-Logik wird getestet...' as status;
