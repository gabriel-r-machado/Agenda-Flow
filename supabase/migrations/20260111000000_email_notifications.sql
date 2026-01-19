-- Enable HTTP extension if not already enabled
create extension if not exists http with schema extensions;

-- Function to send confirmation email when user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  confirmation_url text;
  service_role_key text;
begin
  -- Get the confirmation URL from the user metadata or generate one
  -- Supabase automatically handles the confirmation flow
  
  -- Call the edge function to send confirmation email
  perform
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/send-confirmation-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'email', new.email,
        'name', new.raw_user_meta_data->>'name',
        'confirmationUrl', current_setting('app.settings.site_url') || '/auth/confirm?token=' || new.confirmation_token
      )
    );
    
  return new;
exception
  when others then
    -- Log error but don't block user creation
    raise warning 'Failed to send confirmation email: %', sqlerrm;
    return new;
end;
$$;

-- Function to send password reset email
create or replace function public.handle_password_reset()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Only send email if recovery_token is set (password reset requested)
  if new.recovery_token is not null and (old.recovery_token is null or old.recovery_token != new.recovery_token) then
    perform
      net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/send-password-reset-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
        ),
        body := jsonb_build_object(
          'email', new.email,
          'resetUrl', current_setting('app.settings.site_url') || '/auth?type=recovery&token=' || new.recovery_token
        )
      );
  end if;
  
  return new;
exception
  when others then
    raise warning 'Failed to send password reset email: %', sqlerrm;
    return new;
end;
$$;

-- Create triggers
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists on_auth_user_password_reset on auth.users;
create trigger on_auth_user_password_reset
  after update on auth.users
  for each row execute function public.handle_password_reset();

-- Note: You need to set these configuration values in your Supabase dashboard:
-- ALTER DATABASE postgres SET app.settings.supabase_url = 'https://your-project.supabase.co';
-- ALTER DATABASE postgres SET app.settings.service_role_key = 'your-service-role-key';
-- ALTER DATABASE postgres SET app.settings.site_url = 'http://localhost:3000';
