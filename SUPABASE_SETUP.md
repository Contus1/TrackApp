# Supabase Setup für TrackApp

## 📋 Schritt-für-Schritt Anleitung

### 1. Supabase API-Schlüssel holen

1. **Öffnen Sie Ihr Supabase Dashboard**: https://supabase.com/dashboard/project/zbkshutnsojsrjwzullq

2. **Navigieren Sie zu den API-Einstellungen**:
   - Klicken Sie auf **Settings** (⚙️) in der linken Seitenleiste
   - Wählen Sie **API** aus

3. **Kopieren Sie die benötigten Schlüssel**:
   - **Project URL**: `https://zbkshutnsojsrjwzullq.supabase.co` (bereits eingetragen)
   - **anon public**: Dieser Schlüssel wird für die Client-seitige Authentifizierung verwendet

### 2. Umgebungsvariablen konfigurieren

Öffnen Sie die `.env`-Datei in Ihrem TrackApp-Projekt und tragen Sie den **anon public** Schlüssel ein:

```env
VITE_SUPABASE_URL=https://zbkshutnsojsrjwzullq.supabase.co
VITE_SUPABASE_ANON_KEY=HIER_IHREN_ANON_PUBLIC_SCHLÜSSEL_EINTRAGEN
```

### 3. Datenbank-Schema einrichten

1. **Öffnen Sie den SQL Editor** in Supabase:
   - Gehen Sie zu **SQL Editor** in der linken Seitenleiste
   - Klicken Sie auf **New query**

2. **Führen Sie das Schema-Script aus**:
   - Kopieren Sie den Inhalt der Datei `database-schema.sql`
   - Fügen Sie ihn in den SQL Editor ein
   - Klicken Sie auf **Run** (▶️)

### 4. Authentication konfigurieren

1. **Gehen Sie zu Authentication**:
   - Klicken Sie auf **Authentication** in der linken Seitenleiste
   - Wählen Sie **Settings**

2. **Site URL konfigurieren**:
   - Site URL: `http://localhost:5174` (für Entwicklung)
   - Redirect URLs: `http://localhost:5174/**`

3. **Email Templates anpassen** (optional):
   - Unter **Email Templates** können Sie die E-Mail-Vorlagen auf Deutsch anpassen

### 5. Testen der Verbindung

Nach der Konfiguration können Sie testen, ob die Verbindung funktioniert:

```bash
# Entwicklungsserver starten
npm run dev

# App im Browser öffnen
# http://localhost:5174
```

## 🗄️ Datenbank-Struktur

Das Schema erstellt folgende Tabellen:

- **`exercises`** - Übungen mit Kategorien (Kraft, Cardio, Flexibilität)
- **`workouts`** - Trainingseinheiten
- **`workout_exercises`** - Verknüpfung zwischen Trainings und Übungen
- **`user_profiles`** - Erweiterte Benutzerprofile
- **`fitness_goals`** - Fitness-Ziele der Benutzer

## 🔒 Sicherheit

- **Row Level Security (RLS)** ist für alle Tabellen aktiviert
- Benutzer können nur ihre eigenen Daten sehen und bearbeiten
- Automatische Verknüpfung mit Supabase Auth

## 🧪 Beispiel-Daten

Falls Sie Beispiel-Daten einfügen möchten, uncommentieren Sie die entsprechenden Zeilen am Ende der `database-schema.sql` Datei.

## 🚨 Troubleshooting

### Häufige Probleme:

1. **"Failed to fetch"**: 
   - Prüfen Sie die VITE_SUPABASE_URL in der .env Datei
   - Stellen Sie sicher, dass der Entwicklungsserver läuft

2. **"Invalid API key"**:
   - Prüfen Sie den VITE_SUPABASE_ANON_KEY in der .env Datei
   - Kopieren Sie den Schlüssel erneut aus dem Supabase Dashboard

3. **Authentication Fehler**:
   - Prüfen Sie die Site URL in den Authentication Settings
   - Stellen Sie sicher, dass http://localhost:5174 eingetragen ist

### Logs prüfen:

```bash
# Browser Console für Client-Fehler
# Supabase Dashboard → Logs für Server-Fehler
```

## 📞 Support

Bei weiteren Problemen:
- Supabase Dokumentation: https://supabase.com/docs
- TrackApp GitHub Issues: [Erstellen Sie ein Issue]

---

**Hinweis**: Vergessen Sie nicht, Ihre `.env`-Datei zu Ihrer `.gitignore` hinzuzufügen, um API-Schlüssel nicht versehentlich zu committen!
