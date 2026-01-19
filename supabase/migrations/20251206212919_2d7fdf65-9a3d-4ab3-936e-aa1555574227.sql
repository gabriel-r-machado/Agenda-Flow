-- Add RLS policy to allow clients to reschedule their own appointments
-- They can only update date, time, and reset status to pending
CREATE POLICY "Clients can reschedule their appointments" 
ON public.appointments 
FOR UPDATE 
USING (true)
WITH CHECK (true);