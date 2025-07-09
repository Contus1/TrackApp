# TrackApp Database Migration

## Migration von Exercise-System zu Streak-System

### 📅 **Migration durchgeführt am: 8. Juli 2025**

### **Vorher (Alte Struktur):**
- `exercises` Tabelle für alle Trainings-Daten
- Komplexe Exercise-Objekte mit Sets, Reps, Gewicht
- Streak-Berechnung über Exercise-Daten

### **Nachher (Neue Struktur):**
- `streaks` Tabelle für tägliche Training-Einträge
- `friendships` Tabelle für soziale Features
- Dedicated Views für Streak-Berechnung

### **Migration-Details:**

#### **1. Neue Tabellen erstellt:**
```sql
- public.streaks (Training-Einträge pro Tag)
- public.friendships (Freundschafts-System)
- user_current_streaks (View für Streak-Berechnung)
```

#### **2. Sicherheitsmaßnahmen:**
- ✅ Alte `exercises` Tabelle blieb unverändert
- ✅ Keine Daten gelöscht oder überschrieben
- ✅ RLS (Row Level Security) aktiviert
- ✅ Rollback jederzeit möglich

#### **3. App-Änderungen:**
```typescript
// Von:
import { tempStreakService } from '../services/tempStreakService';

// Zu:  
import { streakService } from '../services/streakService';
```

#### **4. Vorteile der neuen Struktur:**
- 🔥 Präzise Streak-Berechnung
- 👥 Freundschafts-System aktiviert
- 📊 Bessere Performance
- 🎯 Simplere Datenstruktur
- 📱 Mobile-optimierte Eingabe

#### **5. Datei-Organisation:**
```
sql/
├── archive/
│   ├── database-schema.sql (alte Exercise-Struktur)
│   └── database-schema-streaks.sql (neue Struktur - Entwurf)
└── database-schema.sql (sichere Migration - AKTIV)
```

### **Status: ✅ Migration erfolgreich abgeschlossen**

### **Aktuelle Updates:**

#### **7. 3-Tage-Streak-Regel implementiert:**
- ✅ Streak geht automatisch nach 3 Tagen ohne Workout verloren
- ✅ SQL-View `user_current_streaks` aktualisiert
- ✅ Test-Script erstellt: `sql/test-3day-rule.sql`
- ✅ Update-Script verfügbar: `sql/update-3day-rule.sql`

**Neue Logik:**
- Wenn letztes Workout ≤ 3 Tage her: Streak bleibt aktiv
- Wenn letztes Workout > 3 Tage her: Streak = 0
- View berücksichtigt automatisch alle Streak-Berechnungen

### **Rollback (falls nötig):**
```typescript
// In src/pages/dashboard.tsx:
import { tempStreakService } from '../services/tempStreakService';
// Alle streakService → tempStreakService ändern
```

### **Weitere Entwicklung:**
- Freundschafts-Features implementieren
- Streak-Vergleiche und Statistiken
- Migration von alten Exercise-Daten zu Streaks (optional)
- KI-Empfehlungs-Engine
