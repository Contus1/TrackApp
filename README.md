# Tr## Features

- 🏃‍♂️ Track workouts (Gym, Running, Yoga, etc.)
- 🔥 Streak system with 3-day rule
- 👥 Invite friends and compare progress
- 📱 **Progressive Web App (PWA)** - Install on your phone's home screen
- 🔔 **Push notifications** - Send motivation messages to friends who haven't been training
- 💪 Friend profiles with 7-day activity timelines
- 📊 Personal timeline visualization
- 🎯 Profile management with display names
- 🌐 **Offline support** - Works without internet connection
- 🚀 **Native app experience** - Full-screen, app-like interfacepersonal fitness tracking app that helps you track your training streaks and stay motivated with friends.

## Features

- 🏃‍♂️ Track workouts (Gym, Running, Yoga, etc.)
- 🔥 Streak system with 3-day rule
- 👥 Invite friends and compare progress
- 📱 Mobile-first design for on-the-go tracking
- � **NEW: Push notifications** - Send motivation messages to friends who haven't been training
- 💪 Friend profiles with 7-day activity timelines
- 📊 Personal timeline visualization
- 🎯 Profile management with display names

## Progressive Web App (PWA)

TrackApp is a fully functional Progressive Web App that can be installed on your device:

### Installation:
1. **Open TrackApp** in Chrome, Firefox, or Safari
2. **Look for the install prompt** in the dashboard
3. **Click "Install Now"** to add it to your home screen
4. **Launch like a native app** from your home screen

### PWA Features:
- **📱 Home screen icon** - Launch from your device's home screen
- **🌐 Offline support** - Continue using core features without internet
- **⚡ Fast loading** - Cached resources for instant startup
- **🔔 Push notifications** - Receive motivation messages even when app is closed
- **📲 Native experience** - Full-screen, app-like interface
- **🔄 Auto-updates** - Seamless updates in the background

### Device Support:
- ✅ **iPhone/iPad** - iOS 11.3+
- ✅ **Android** - Chrome 42+
- ✅ **Desktop** - Chrome, Firefox, Edge

The app now includes a friend motivation system:

- **Automatic Detection**: The app detects when friends haven't trained for 2+ days
- **Quick Motivation**: Send instant motivational push notifications to inactive friends
- **Custom Messages**: Write personalized motivational messages
- **Real-time Notifications**: Friends receive push notifications directly in their browser
- **Notification History**: View all received motivational messages

### How it works:

1. Enable push notifications in your dashboard
2. View friend profiles to see their activity status
3. If a friend hasn't trained in 2+ days, you'll see a "Send Motivation" button
4. Choose between quick motivation or custom messages
5. Friend receives an instant push notification to get back to training!

## Setup

To run the project locally:

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase configuration to .env

# Set up database
# 1. Run supabase-setup-fixed.sql in your Supabase SQL editor
# 2. Run push-notification-setup.sql for push notifications
# 3. Optionally run fix-existing-users.sql for existing users

# Start development server
npm run dev
```

## Database Setup

The app requires several SQL files to be run in your Supabase SQL editor:

1. **supabase-setup-fixed.sql** - Main database structure and profiles
2. **push-notification-setup.sql** - Push notification tables and functions
3. **fix-existing-users.sql** - Backfill profiles for existing users (optional)

## Tech Stack

- React 18 + TypeScript
- Tailwind CSS v4 for styling
- Supabase for backend & authentication
- Vite as build tool
- Web Push API for notifications
- Service Worker for push notification handling

## Files Overview

### Core Components
- `src/pages/dashboard.tsx` - Main dashboard with streaks and friends
- `src/components/FriendProfile.tsx` - Friend profile with motivation features
- `src/components/NotificationSetup.tsx` - Push notification setup
- `src/components/NotificationList.tsx` - Display received notifications

### Services
- `src/services/notificationService.ts` - Handle push notifications
- `src/services/supabase.ts` - Supabase client configuration
- `src/services/streakService.ts` - Workout streak management

### Database
- `push-notification-setup.sql` - Notification system setup
- `supabase-setup-fixed.sql` - Main database structure
- `public/sw.js` - Service worker for push notifications

---

*A project by Carl Lichtl*

