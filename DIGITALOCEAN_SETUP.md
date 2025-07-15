# 🚀 DigitalOcean Environment Variables Setup

## 📋 Schritt-für-Schritt Anleitung

### 1. DigitalOcean App Platform öffnen
1. Gehe zu [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Finde deine **TrackApp** in der Liste
3. Klicke auf den App-Namen

### 2. Environment Variables hinzufügen
1. Klicke auf **"Settings"** Tab
2. Scrolle zu **"App-Level Environment Variables"**
3. Klicke **"Edit"**

### 3. Diese Variables hinzufügen:

```
REACT_APP_SUPABASE_URL=https://zbkshutnsojsrjwzullq.supabase.co
```

```
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpia3NodXRuc29qc3Jqd3p1bGxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMDIzMDksImV4cCI6MjA2NzU3ODMwOX0.G3h5PuawfEi3h3CmH6BQx_TQ24yOW28Pleq1ftjXe-M
```

```
NODE_ENV=production
```

```
REACT_APP_VERSION=2.0.0
```

### 4. Deployment triggern
1. Klicke **"Save"**
2. DigitalOcean wird automatisch neu deployen
3. Warte auf "Deployment Successful" ✅

### 5. Testen
1. Öffne deine App: https://seal-app-gtedv.ondigitalocean.app/
2. Cache leeren: `Cmd + Shift + R` (Mac) oder `Ctrl + Shift + F5` (Windows)
3. Supabase-Features sollten jetzt funktionieren! 🎉

## ⚠️ Wichtige Hinweise:

- **Niemals** die echte `.env` ins Git-Repository committen
- Die `.env.example` ist öffentlich sichtbar (keine echten Keys!)
- Bei Environment Variable Änderungen immer neu deployen
- Cache-Invalidierung nach Deployment prüfen

## 🔍 Troubleshooting:

Wenn die App immer noch nicht funktioniert:
1. **Logs prüfen**: DigitalOcean App Platform → Runtime Logs
2. **Browser Console**: F12 → Console Tab nach Fehlern schauen  
3. **Network Tab**: Prüfen ob Supabase-Requests erfolgreich sind
4. **Incognito Mode**: Teste in privatem Browser-Fenster
