# DigitalOcean Deployment Setup - TrackApp

## 🚀 Schritt-für-Schritt Anleitung

### 1. Supabase Credentials finden

1. Gehe zu [supabase.com](https://supabase.com) und logge dich ein
2. Wähle dein TrackApp Projekt aus
3. Gehe zu **Settings** → **API**
4. Kopiere diese Werte:
   - **Project URL** (beginnt mit `https://[projekt-id].supabase.co`)
   - **anon public key** (langer String beginnend mit `eyJ...`)

### 2. Environment Variables in DigitalOcean setzen

1. Gehe zu deiner App in der DigitalOcean App Platform
2. Klicke auf **Settings** → **Environment Variables**
3. Füge diese Variablen hinzu:

```bash
VITE_SUPABASE_URL=https://dein-projekt-id.supabase.co
VITE_SUPABASE_ANON_KEY=dein_anon_key_hier
NODE_ENV=production
PORT=8080
```

**Wichtig:** Ersetze die Werte mit deinen echten Supabase Credentials!

### 3. App neu deployen

1. Nach dem Hinzufügen der Environment Variables
2. Klicke auf **Deploy** → **Redeploy**
3. Warte bis der Deploy abgeschlossen ist

### 4. Fehlerdiagnose

Wenn Login immer noch nicht funktioniert:

**A) Prüfe die Browser-Konsole:**
1. Öffne deine App
2. Drücke F12 (Developer Tools)
3. Gehe zum **Console** Tab
4. Schaue nach Fehlermeldungen

**B) Häufige Probleme:**
- ❌ **"Failed to fetch"** = Environment Variables nicht gesetzt
- ❌ **"Invalid API key"** = Falscher Supabase Key
- ❌ **"Invalid URL"** = Falsche Supabase URL

**C) Teste Supabase direkt:**
```bash
# Teste ob deine Supabase URL erreichbar ist
curl https://dein-projekt-id.supabase.co/rest/v1/
```

### 5. Supabase Database Setup

Wenn Login funktioniert, aber andere Features nicht:

1. Gehe zu Supabase Dashboard → **SQL Editor**
2. Führe diese SQL-Files aus (in dieser Reihenfolge):
   ```sql
   -- 1. Hauptdatenbank:
   supabase-setup-fixed.sql
   
   -- 2. Push Notifications:
   push-notification-setup.sql
   
   -- 3. Bestehende User reparieren (optional):
   fix-existing-users.sql
   ```

### 6. Domain Setup (Optional)

Um eine eigene Domain zu verwenden:
1. Gehe zu **Settings** → **Domains**
2. Füge deine Domain hinzu
3. Folge den DNS-Anweisungen

## ✅ Erfolg testen

Nach dem Setup solltest du können:
- ✅ Account registrieren
- ✅ Einloggen/Ausloggen  
- ✅ Workouts hinzufügen
- ✅ Freunde einladen
- ✅ AI Coach verwenden

## 🆘 Support

Falls Probleme auftreten:
1. Prüfe die Browser-Konsole auf Errors
2. Schaue in die DigitalOcean Deploy-Logs
3. Teste die Supabase Verbindung direkt
4. Überprüfe alle Environment Variables

Die App zeigt dir jetzt auch hilfreiche Fehlermeldungen statt nur "Failed to fetch"!
