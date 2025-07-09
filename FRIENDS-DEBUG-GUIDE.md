# 🛠 Freunde-System Debugging

## Problem identifiziert
Das Freunde-Einladungssystem funktioniert noch nicht richtig. Hier ist die Schritt-für-Schritt-Lösung:

## 🚀 Sofortige Lösung

### 1. SQL-Setup in Supabase ausführen
```sql
-- Kopiere und führe aus: sql/simple-friends-setup.sql
-- Das Script ist vereinfacht und sollte definitiv funktionieren
```

### 2. Debug-Panel verwenden
- Öffne die App: http://localhost:5177
- Melde dich an
- Scrolle nach unten zum gelben "🐛 Friends Debug Panel"
- Teste zuerst "Test Tabelle" → sollte grün werden
- Dann teste "Test Einladung" mit einer E-Mail

### 3. Häufige Probleme & Lösungen

#### Problem: "RPC function not found"
**Lösung:** SQL-Script nochmal ausführen
```sql
CREATE OR REPLACE FUNCTION generate_invite_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Problem: "Table does not exist"
**Lösung:** Tabelle manuell erstellen
```sql
CREATE TABLE public.friends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inviter_id UUID NOT NULL,
    invitee_id UUID,
    invitee_email TEXT,
    invite_token TEXT UNIQUE,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Problem: "Row Level Security violation"
**Lösung:** Einfache Policy setzen
```sql
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated users" 
ON public.friends FOR ALL 
USING (auth.uid() IS NOT NULL);
```

## 🔍 Debug-Schritte

1. **Browser öffnen:** http://localhost:5177
2. **Anmelden** (falls nicht angemeldet)
3. **Debug-Panel finden** (gelber Kasten)
4. **"Test Tabelle" klicken** → prüft Grundsetup
5. **E-Mail eingeben und "Test Einladung" klicken**
6. **Console öffnen** (F12) für detaillierte Logs
7. **Ergebnis analysieren** im Debug-Panel

## 📋 Was zu erwarten ist

### Erfolgreicher Test:
```json
{
  "user": "user-uuid",
  "email": "test@example.com",
  "rpc": { "tokenData": "abc123...", "tokenError": null },
  "table": { "friendsData": [], "friendsError": null },
  "service": { 
    "data": { 
      "token": "abc123...", 
      "url": "http://localhost:5177/invite/abc123..." 
    }, 
    "error": null 
  }
}
```

### Fehlgeschlagener Test:
```json
{
  "rpc": { "tokenError": "function does not exist" },
  "table": { "friendsError": "relation does not exist" }
}
```

## 🛠 Nach dem Fix

Wenn das Debug-Panel grüne Ergebnisse zeigt:

1. **Debug-Panel entfernen** (aus dashboard.tsx)
2. **Normale Freunde-Einladung testen**
3. **Deep Links testen** mit generierten URLs

## 💡 Tipps

- **Supabase Dashboard:** Gehe zu SQL Editor → "New Query"
- **Copy-Paste:** Verwende das `simple-friends-setup.sql` komplett
- **Refresh:** Nach SQL-Änderungen Browser refreshen
- **Logs:** Alle Schritte werden in Browser-Console geloggt

## 🚨 Fallback-Plan

Falls gar nichts funktioniert, nutze diese minimal-Version:

```sql
-- Nur für Tests - unsicher aber funktional
ALTER TABLE public.friends DISABLE ROW LEVEL SECURITY;
```

**Wichtig:** Das ist nur für Development! In Production RLS immer aktiviert lassen.

---

**Nächster Schritt:** Führe `sql/simple-friends-setup.sql` in Supabase aus und teste das Debug-Panel!
