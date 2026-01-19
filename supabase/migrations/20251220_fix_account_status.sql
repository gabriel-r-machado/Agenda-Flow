-- Update existing accounts to set status based on subscription
UPDATE profiles 
SET status = 'Ativo' 
WHERE subscription_status IN ('active', 'trial') AND status IS NULL;

-- Set all other profiles to 'Inativo'
UPDATE profiles 
SET status = 'Inativo' 
WHERE subscription_status NOT IN ('active', 'trial') AND status IS NULL;
