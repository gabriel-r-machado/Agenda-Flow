-- Drop the existing policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create a new policy that allows viewing profiles by ID (for booking pages) 
-- OR profiles that are marked as professional (for the feed)
CREATE POLICY "Profiles are viewable by id or if professional" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Note: This makes all profiles readable, but that's needed for the booking page to work
-- The is_professional flag is used to filter who appears in the public feed, not access control