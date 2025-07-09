-- Push Notification System for Friend Motivation
-- This file sets up the database structure for push notifications

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL DEFAULT 'motivation',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Create push_subscriptions table to store web push subscription data
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, endpoint)
);

-- 3. Enable RLS (Row Level Security)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users can create notifications for friends" ON public.notifications
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.friends 
      WHERE (inviter_id = auth.uid() AND invitee_id = recipient_id)
         OR (invitee_id = auth.uid() AND inviter_id = recipient_id)
    )
  );

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = recipient_id);

-- 5. Create RLS policies for push subscriptions
CREATE POLICY "Users can manage their own push subscriptions" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON public.notifications(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);

-- 7. Create function to check if friend needs motivation
CREATE OR REPLACE FUNCTION check_friend_needs_motivation(friend_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  last_workout_date DATE;
  days_since_workout INTEGER;
BEGIN
  -- Get the most recent workout date
  SELECT MAX(date) INTO last_workout_date
  FROM public.streaks
  WHERE user_id = friend_id;
  
  -- If no workouts found, they need motivation
  IF last_workout_date IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Calculate days since last workout
  days_since_workout := CURRENT_DATE - last_workout_date;
  
  -- Return true if they haven't worked out in the last 2 days
  RETURN days_since_workout >= 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create function to send motivation notification
CREATE OR REPLACE FUNCTION send_motivation_notification(
  friend_id UUID,
  motivation_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
  sender_name TEXT;
  default_message TEXT;
BEGIN
  -- Get sender's name
  SELECT display_name INTO sender_name
  FROM public.profiles
  WHERE id = auth.uid();
  
  -- Use custom message or default
  IF motivation_message IS NULL THEN
    default_message := sender_name || ' thinks you should get back to training! 💪';
  ELSE
    default_message := motivation_message;
  END IF;
  
  -- Insert notification
  INSERT INTO public.notifications (
    sender_id,
    recipient_id,
    type,
    title,
    message
  ) VALUES (
    auth.uid(),
    friend_id,
    'motivation',
    'Time to get moving!',
    default_message
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 10. Create trigger to update push_subscriptions updated_at
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_push_subscriptions_updated_at ON public.push_subscriptions;
CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_push_subscriptions_updated_at();

-- Test the setup
SELECT 'Push notification system setup complete!' as status;
