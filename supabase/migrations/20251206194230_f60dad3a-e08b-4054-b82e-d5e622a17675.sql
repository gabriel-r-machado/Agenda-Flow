-- Drop the existing policies to recreate them properly
DROP POLICY IF EXISTS "Clients can view their own appointments by phone" ON public.appointments;
DROP POLICY IF EXISTS "Professionals can view their appointments " ON public.appointments;
DROP POLICY IF EXISTS "Professionals can view their appointments" ON public.appointments;

-- Create a single policy that allows both professionals AND public access for viewing
CREATE POLICY "Anyone can view appointments for booking"
ON public.appointments
FOR SELECT
USING (true);