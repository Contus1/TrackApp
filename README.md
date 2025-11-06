# TrackApp

A clean, fast, and social fitness tracker built as a modern Progressive Web App (PWA).

## Overview

TrackApp helps you stay consistent with your training while keeping fitness social and simple. It runs directly in your browser, works offline, and can be installed like a native app.

### Core Features

* Progressive Web App with offline mode
* Streak tracking and activity logs
* Friends system to connect and compare progress
* Mood and training tracking
* Push notifications for reminders and milestones
* Responsive and minimal interface built with Tailwind CSS

## Tech Stack

* **Frontend:** React 18 + TypeScript
* **Styling:** Tailwind CSS
* **Backend:** Supabase
* **Deployment:** DigitalOcean App Platform

## Setup

### 1. Clone the Project

```bash
git clone https://github.com/Contus1/TrackApp.git
cd TrackApp
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit the `.env` file with your Supabase project URL and anon key.
Never commit your real `.env` file.

### 3. Connect to Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key (under Settings → API)
3. Add them to the `.env` file

## Development

```bash
npm install
npm start
```

### Build for Production

```bash
npm run build
npm run serve
```

## PWA Installation

You can install TrackApp on any device for a native-like experience with offline support.

---

**Developed by Carl Lichtl**
Focused on creating reliable, social, and intuitive digital tools for everyday fitness.
