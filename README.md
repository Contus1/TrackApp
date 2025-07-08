# TrackApp 💪

Eine mobile-first Fitness-Tracking-App, entwickelt mit React, TypeScript, Vite und Tailwind CSS.

## 🚀 Features

- **Mobile-first Design**: Optimiert für Smartphones und Tablets
- **Responsive UI**: Schöne und moderne Benutzeroberfläche mit Tailwind CSS
- **Trainings-Tracking**: Übungen, Sätze, Wiederholungen und Gewichte verfolgen
- **Benutzer-Authentication**: Sichere Anmeldung und Registrierung mit Supabase
- **Real-time Updates**: Live-Synchronisation der Daten
- **TypeScript**: Vollständig typisiert für bessere Entwicklererfahrung

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS (mobile-first)
- **Backend**: Supabase (Database + Auth)
- **Build Tool**: Vite
- **Package Manager**: npm

## 📱 Projektstruktur

```
TrackApp/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/              # Bilder, Icons, etc.
│   ├── components/          # Wiederverwendbare Komponenten
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ExerciseCard.tsx
│   ├── pages/               # Hauptseiten der App
│   │   ├── start.tsx        # Landing Page
│   │   ├── index.tsx        # Login-Seite
│   │   ├── register.tsx     # Registrierungs-Seite
│   │   └── dashboard.tsx    # Trainingsübersicht
│   ├── services/           # API-Services
│   │   └── supabase.ts     # Supabase-Client
│   ├── styles/             # Globale Styles
│   │   └── globals.css     # Tailwind-Direktiven
│   └── App.tsx             # Haupt-App-Komponente
├── .env.example            # Umgebungsvariablen-Vorlage
├── tailwind.config.js      # Tailwind-Konfiguration
├── postcss.config.js       # PostCSS-Konfiguration
└── package.json
```

## 🏃‍♂️ Lokaler Start

### Voraussetzungen

- Node.js (Version 18 oder höher)
- npm oder yarn
- Supabase-Account für Backend-Services

### Installation

1. **Repository klonen**:
   ```bash
   git clone <GITHUB_REPO_URL>
   cd TrackApp
   ```

2. **Abhängigkeiten installieren**:
   ```bash
   npm install
   ```

3. **Umgebungsvariablen einrichten**:
   ```bash
   cp .env.example .env
   ```
   
   Öffnen Sie die `.env`-Datei und tragen Sie Ihre Supabase-Daten ein:
   ```env
   VITE_SUPABASE_URL=https://ihre-projekt-id.supabase.co
   VITE_SUPABASE_ANON_KEY=ihr_supabase_anon_key_hier
   ```

4. **Entwicklungsserver starten**:
   ```bash
   npm run dev
   ```

5. **App öffnen**: 
   Navigieren Sie zu `http://localhost:5173` in Ihrem Browser

## 🗄️ Supabase Setup

### 1. Supabase-Projekt erstellen

1. Gehen Sie zu [supabase.com](https://supabase.com)
2. Erstellen Sie ein neues Projekt
3. Notieren Sie sich die Project URL und den Anon Key

### 2. Umgebungsvariablen setzen

Kopieren Sie die Werte aus Ihrem Supabase Dashboard:

- **Project URL**: Settings → General → Reference ID
- **Anon Key**: Settings → API → Project API keys → anon public

### 3. Datenbank-Schema (optional)

Für die vollständige Funktionalität erstellen Sie folgende Tabellen in Supabase:

```sql
-- Übungen-Tabelle
CREATE TABLE exercises (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  sets integer,
  reps integer,
  weight numeric,
  duration integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trainingseinheiten-Tabelle
CREATE TABLE workouts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_time timestamptz DEFAULT now(),
  end_time timestamptz,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);
```

## 📱 Mobile-First Optimierungen

- **Viewport-Meta-Tag**: Korrekt für mobile Geräte eingestellt
- **Touch-optimierte Buttons**: Mindestgröße 44px für bessere Usability
- **Responsive Breakpoints**: Mobile-first Ansatz mit Tailwind CSS
- **Safe Area Support**: Unterstützung für iPhone-Notch und ähnliche Features
- **Performance**: Optimiert für langsamere mobile Verbindungen

## 🛠 Verfügbare Scripts

- `npm run dev` - Entwicklungsserver starten
- `npm run build` - Produktions-Build erstellen
- `npm run preview` - Produktions-Build lokal testen
- `npm run lint` - Code-Linting ausführen

## 📝 Lizenz

MIT License - siehe [LICENSE](LICENSE) für Details.

## 🤝 Beitragen

1. Fork das Projekt
2. Erstellen Sie einen Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Committen Sie Ihre Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Push zum Branch (`git push origin feature/AmazingFeature`)
5. Öffnen Sie einen Pull Request

## 📞 Support

Bei Fragen oder Problemen erstellen Sie bitte ein Issue im GitHub Repository.

---

**Hinweis**: Diese App ist für mobile Geräte optimiert und bietet die beste Erfahrung auf Smartphones und Tablets.
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
