-- Add reminder_interval_hours column to reminders table
-- This allows users to set how often they want to be reminded (in hours)
-- NULL means no recurring notifications, just notify on due_date
ALTER TABLE public.reminders 
ADD COLUMN IF NOT EXISTS reminder_interval_hours integer DEFAULT NULL;

-- Add a comment explaining the column
COMMENT ON COLUMN public.reminders.reminder_interval_hours IS 'Interval in hours for recurring reminder notifications. NULL means no recurring notifications.';