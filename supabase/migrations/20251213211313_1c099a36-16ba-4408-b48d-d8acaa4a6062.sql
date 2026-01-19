-- Add RLS policy for professionals to delete their own appointments
CREATE POLICY "Professionals can delete their appointments"
ON public.appointments
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = appointments.professional_id 
  AND profiles.user_id = auth.uid()
));