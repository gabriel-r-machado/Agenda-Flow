-- Add account status field to profiles table
ALTER TABLE profiles 
ADD COLUMN status TEXT DEFAULT 'Inativo' CHECK (status IN ('Ativo', 'Inativo'));

-- Create index for faster filtering
CREATE INDEX idx_profiles_status ON profiles(status);

-- Set accounts to 'Ativo' only if they have an active subscription or trial
UPDATE profiles 
SET status = 'Ativo' 
WHERE subscription_status IN ('active', 'trial');

