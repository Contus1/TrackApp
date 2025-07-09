# TrackApp - Fitness Tracking App

Eine mobile-first Fitness-Tracking-App mit React, TypeScript, Tailwind CSS und Supabase.

## Features
- 🏃‍♂️ Fitness Streaks tracken
- 👥 Freunde einladen und vergleichen
- 📱 Mobile-optimierte Benutzeroberfläche
- 🔐 Sichere Authentifizierung mit Supabase
- ⚡ Schnelle Performance mit Vite

## Installation

### 1. Repository klonen
```bash
git clone https://github.com/yourusername/TrackApp.git
cd TrackApp
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Umgebungsvariablen einrichten
```bash
cp .env.example .env
```

Bearbeite die `.env` Datei und füge deine Supabase-Konfiguration hinzu:
- `VITE_SUPABASE_URL`: Deine Supabase Project URL
- `VITE_SUPABASE_ANON_KEY`: Dein Supabase Anon Public Key

### 4. Entwicklungsserver starten
```bash
npm run dev
```

## Build für Produktion
```bash
npm run build
npm run preview
```

## Technologien
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Supabase
- PWA-ready

