
-- Create a function that calls the send-welcome-email edge function
CREATE OR REPLACE FUNCTION public.notify_welcome_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payload jsonb;
  request_id bigint;
BEGIN
  payload := jsonb_build_object(
    'user_id', NEW.user_id,
    'display_name', NEW.display_name
  );

  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL') || '/functions/v1/send-welcome-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY')
    ),
    body := payload
  ) INTO request_id;

  RETURN NEW;
END;
$$;

-- Create trigger on profiles table for new inserts
CREATE TRIGGER on_profile_created_send_welcome
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_welcome_email();
