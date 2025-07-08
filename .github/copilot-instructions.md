<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# TrackApp - Copilot Instructions

Dieses ist ein Fitness-Tracking-App-Projekt mit folgenden Spezifikationen:

## Technischer Stack
- **Frontend**: React 18 mit TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (mobile-first Ansatz)
- **Backend**: Supabase (Authentication + Database)
- **Deployment**: Für mobile und web Plattformen optimiert

## Design-Prinzipien
- **Mobile-first**: Alle Komponenten sollen primär für mobile Geräte optimiert sein
- **Touch-friendly**: Buttons und interaktive Elemente mindestens 44px groß
- **Responsive**: Verwendung von Tailwind's responsive Breakpoints
- **Accessibility**: ARIA-Labels und semantisches HTML verwenden
- **Performance**: Optimiert für mobile Verbindungen

## Code-Konventionen
- Verwende TypeScript für alle Komponenten und Services
- Funktionale Komponenten mit React Hooks
- Tailwind CSS-Klassen für Styling (keine CSS-Module)
- Deutsche Sprache für UI-Texte und Kommentare
- Konsistente Namenskonvention: PascalCase für Komponenten, camelCase für Funktionen

## Dateistruktur
- `/src/components/`: Wiederverwendbare UI-Komponenten
- `/src/pages/`: Hauptseiten der Anwendung
- `/src/services/`: API-Services und Datenmanagement
- `/src/styles/`: Globale Styles und Tailwind-Konfiguration

## Spezielle Anforderungen
- Alle Komponenten sollen responsive und mobile-optimiert sein
- Verwende Supabase für Authentication und Datenbank-Operationen
- Implementiere Loading-States und Error-Handling
- Deutsche Benutzeroberfläche mit angemessenen Fehlermeldungen
- Safe Area Support für iOS-Geräte

## Fitness-App Features
- Übungen tracken (Sets, Reps, Gewicht, Dauer)
- Benutzer-Authentication
- Dashboard mit Trainingsübersicht
- Exercise Cards mit verschiedenen Kategorien (Kraft, Cardio, Flexibilität)
- Progress Tracking und Statistiken

Befolge diese Richtlinien beim Generieren von Code für dieses Projekt.
