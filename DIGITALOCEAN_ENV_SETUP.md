# 🌐 DigitalOcean App Platform Environment Variables Setup

## ⚠️ WICHTIG: Diese Environment Variables musst du in DigitalOcean setzen!

Deine lokale `.env` Datei wird **NICHT** deployed. Du musst die Environment Variables in der DigitalOcean App Platform Console konfigurieren.

## 🔧 Erforderliche Environment Variables:

### 1. **REACT_APP_SUPABASE_URL**
```
Name: REACT_APP_SUPABASE_URL
Value: https://zbkshutnsojsrjwzullq.supabase.co
Type: SECRET (recommended)
```

### 2. **REACT_APP_SUPABASE_ANON_KEY**
```
Name: REACT_APP_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpia3NodXRuc29qc3Jqd3p1bGxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMDIzMDksImV4cCI6MjA2NzU3ODMwOX0.G3h5PuawfEi3h3CmH6BQx_TQ24yOW28Pleq1ftjXe-M
Type: SECRET
```

## 📝 DigitalOcean Setup Schritte:

### Option A: App Spec YAML (Empfohlen)
```yaml
name: trackapp
services:
- name: web
  source_dir: /
  github:
    repo: your-username/trackapp
    branch: main
  build_command: npm install && npm run build
  run_command: npx serve -s build -p $PORT
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  routes:
  - path: /
  envs:
  - key: REACT_APP_SUPABASE_URL
    value: https://zbkshutnsojsrjwzullq.supabase.co
    type: SECRET
    scope: BUILD_AND_RUN_TIME
  - key: REACT_APP_SUPABASE_ANON_KEY
    value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpia3NodXRuc29qc3Jqd3p1bGxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMDIzMDksImV4cCI6MjA2NzU3ODMwOX0.G3h5PuawfEi3h3CmH6BQx_TQ24yOW28Pleq1ftjXe-M
    type: SECRET
    scope: BUILD_AND_RUN_TIME
```

### Option B: DigitalOcean Dashboard
1. **Go to your App**: DigitalOcean Dashboard → Apps → [Your App]
2. **Settings Tab**: Click on "Settings"
3. **Environment Variables**: Add each variable:
   - **REACT_APP_SUPABASE_URL**: `https://zbkshutnsojsrjwzullq.supabase.co`
   - **REACT_APP_SUPABASE_ANON_KEY**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
4. **Deploy**: Trigger a new deployment

## 🔒 Sicherheitshinweise:

### ✅ Das ist OK (Public Keys):
- `REACT_APP_SUPABASE_URL` - Öffentlich sichtbar
- `REACT_APP_SUPABASE_ANON_KEY` - Anon Key, designed für Client-Side

### ❌ NIEMALS Committen:
- `SUPABASE_SERVICE_ROLE_KEY` - Nur für Server, nicht für Frontend
- Private Keys oder Secrets

## 🧪 Test nach Deployment:

Nach dem Deployment teste:
```bash
# In Browser Console:
console.log(process.env.REACT_APP_SUPABASE_URL);
console.log(process.env.REACT_APP_SUPABASE_ANON_KEY);
```

Beide sollten die korrekten Werte anzeigen.

## 🔄 Automatische Deployments:

```yaml
# In deiner App Spec für Auto-Deploy:
source:
  repo: https://github.com/your-username/trackapp
  branch: main
  auto_deploy: true
```

## 📞 Troubleshooting:

**Problem**: App startet, aber Supabase funktioniert nicht
**Lösung**: Environment Variables prüfen

**Problem**: "process.env.REACT_APP_* is undefined"
**Lösung**: 
1. Environment Variables sind korrekt gesetzt in DigitalOcean
2. Scope ist "BUILD_AND_RUN_TIME"
3. App wurde nach Variable-Änderung neu deployed

**Problem**: CORS Errors
**Lösung**: Supabase CORS Settings prüfen für deine DigitalOcean Domain
