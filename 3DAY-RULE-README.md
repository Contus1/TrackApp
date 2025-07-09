# 🔥 3-Tage-Streak-Regel

## Übersicht
Die TrackApp implementiert jetzt eine automatische 3-Tage-Regel für Streaks:
- **Streaks bleiben aktiv** wenn das letzte Workout ≤ 3 Tage her ist
- **Streaks werden automatisch auf 0 gesetzt** wenn das letzte Workout > 3 Tage her ist

## 🛠 Implementierung

### SQL-View Updates
Die View `user_current_streaks` wurde erweitert:

```sql
WITH latest_workout AS (
    SELECT 
        user_id,
        MAX(date) as last_workout_date,
        CURRENT_DATE - MAX(date) as days_since_last_workout
    FROM public.streaks
    GROUP BY user_id
),
streak_calculation AS (
    SELECT 
        s.user_id,
        s.date,
        ROW_NUMBER() OVER (PARTITION BY s.user_id ORDER BY s.date DESC) as day_rank,
        CURRENT_DATE - s.date as days_ago
    FROM public.streaks s
    INNER JOIN latest_workout lw ON s.user_id = lw.user_id
    WHERE s.date <= CURRENT_DATE
        AND lw.days_since_last_workout <= 3  -- 🔑 Hier ist die 3-Tage-Regel
)
```

### Frontend Integration
Keine Frontend-Änderungen nötig! Die bestehende Logik funktioniert:

```typescript
// Weiterhin derselbe Aufruf:
const { data, error } = await streakService.getCurrentStreak(user.id);
// → Gibt automatisch 0 zurück wenn Streak > 3 Tage alt
```

## 📁 Dateien

### Neue Dateien:
- `sql/update-3day-rule.sql` - Isoliertes Update für die View
- `sql/test-3day-rule.sql` - Test-Script mit Beispieldaten  
- `test-frontend-3day-rule.js` - Frontend-Test für Browser-Console

### Aktualisierte Dateien:
- `database-schema.sql` - Enthält die neue View-Logik
- `MIGRATION.md` - Dokumentiert die neue Regel

## 🧪 Testen

### 1. SQL-Tests in Supabase:
```sql
-- View-Update ausführen:
\i sql/update-3day-rule.sql

-- Test-Daten erstellen und testen:
\i sql/test-3day-rule.sql
```

### 2. Frontend-Tests:
1. App öffnen: http://localhost:5177
2. Browser-Entwicklertools → Console
3. Script ausführen: `test-frontend-3day-rule.js`

### 3. Manuelle Tests:
1. **Aktueller Streak**: Heute trainieren → Streak sollte angezeigt werden
2. **3-Tage-Grenze**: Vor 3 Tagen trainiert → Streak sollte noch da sein
3. **Streak verloren**: Vor 4+ Tagen trainiert → Streak sollte 0 sein

## 📊 Testszenarien

| Letztes Workout | Erwarteter Streak | Status |
|----------------|-------------------|--------|
| Heute | Volle Länge | ✅ Aktiv |
| Gestern | Volle Länge | ✅ Aktiv |  
| Vor 2 Tagen | Volle Länge | ✅ Aktiv |
| Vor 3 Tagen | Volle Länge | ✅ Grenzfall - noch aktiv |
| Vor 4 Tagen | 0 | ⚠️ Verloren |
| Vor 1 Woche | 0 | ⚠️ Verloren |

## 🔄 Automatik
- **Keine Cron-Jobs nötig**: View berechnet bei jedem Aufruf neu
- **Real-time**: Sofortige Aktualisierung when Streak-Daten sich ändern
- **Performance**: Optimiert durch Indizes auf `user_id` und `date`

## 🛡 Fallback
Falls Probleme auftreten:
1. Alte View wiederherstellen: `sql/archive/database-schema.sql`
2. Oder: Temporär auf `tempStreakService` zurückwechseln

## 🎯 Nächste Schritte
- [ ] Benachrichtigungen bei Streak-Verlust (Tag 3)
- [ ] Motivations-Nachrichten für Comeback
- [ ] Streak-Freeze Feature (Urlaubsmodus)
- [ ] Streak-Statistiken (längster Streak, etc.)
