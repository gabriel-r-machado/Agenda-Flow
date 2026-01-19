-- Create function to sync account status based on trial and subscription
CREATE OR REPLACE FUNCTION public.sync_account_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- If subscription is active or trial is still active, set status to 'Ativo'
  IF NEW.subscription_status = 'active' OR (NEW.trial_ends_at IS NOT NULL AND NEW.trial_ends_at > NOW()) THEN
    NEW.status = 'Ativo';
  ELSE
    -- If subscription is not active and trial expired, set status to 'Inativo'
    NEW.status = 'Inativo';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update status when subscription_status or trial_ends_at changes
DROP TRIGGER IF EXISTS sync_account_status_trigger ON public.profiles;
CREATE TRIGGER sync_account_status_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_account_status();

-- Update existing profiles to match current status
UPDATE public.profiles
SET status = CASE 
  WHEN subscription_status = 'active' OR (trial_ends_at IS NOT NULL AND trial_ends_at > NOW()) THEN 'Ativo'
  ELSE 'Inativo'
END;
