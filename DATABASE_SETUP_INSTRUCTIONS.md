# Database Setup Instructions

## To enable push notifications, you need to run the SQL setup in Supabase.

### Steps:

1. **Open your Supabase Dashboard**
   - Go to https://app.supabase.com
   - Navigate to your project
   - Go to "SQL Editor"

2. **Run the notification setup SQL**
   - Copy the entire contents of `push-notification-setup.sql`
   - Paste it into the SQL editor
   - Click "Run"

3. **Refresh your TrackApp**
   - The notification system should now work
   - You'll see the notification setup component instead of the error

### What the SQL does:
- Creates `notifications` table for storing messages
- Creates `push_subscriptions` table for web push data
- Adds database functions for checking friend activity
- Sets up security policies (RLS)
- Creates helper functions for sending notifications

### After setup:
- Users can enable push notifications in their dashboard
- Friends can send motivational messages when others haven't trained
- Real-time push notifications work in the browser
- Notification history is stored and displayed

### Troubleshooting:
- If you see "Failed to load notifications", the SQL hasn't been run yet
- If notifications don't work, check browser permissions
- Make sure your app is running on HTTPS in production (required for push notifications)

The app will gracefully handle missing database tables and show setup instructions to users.
