-- Sync subscription_tier based on Stripe price IDs
-- This ensures the correct plan tier is assigned based on what the user actually purchased

-- 1. First, ensure the column exists with a default value
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';

-- 2. Quem tem o ID do plano BÁSICO vira 'basic'
UPDATE profiles 
SET subscription_tier = 'basic'
WHERE subscription_status = 'active'
AND price_id = 'price_1S6JQ7GgnTSDhFJSFTxI6mxm';

-- 3. Quem tem o ID do plano PRO vira 'professional'
UPDATE profiles 
SET subscription_tier = 'professional'
WHERE subscription_status = 'active'
AND price_id = 'price_1S6JRNGgnTSDhFJSSalULAqg';

-- 4. Quem está em Trial vira 'professional' temporariamente
UPDATE profiles 
SET subscription_tier = 'professional'
WHERE subscription_status = 'trial';

-- 5. Quem não pagou vira 'free'
UPDATE profiles 
SET subscription_tier = 'free'
WHERE subscription_status NOT IN ('active', 'trial');

-- 6. Create an index on subscription_tier for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
