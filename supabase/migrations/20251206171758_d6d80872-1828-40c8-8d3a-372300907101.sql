-- Allow anyone to insert clients (needed for public booking)
CREATE POLICY "Anyone can create clients during booking" 
ON public.clients 
FOR INSERT 
WITH CHECK (true);