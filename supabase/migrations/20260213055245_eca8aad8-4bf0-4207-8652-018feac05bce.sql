
-- Add a function to activate a pending subscription
-- Sets starts_at to now() and expires_at to now() + plan_days
CREATE OR REPLACE FUNCTION public.activate_subscription(_subscription_id uuid, _user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.user_subscriptions
  SET 
    payment_status = 'approved',
    starts_at = now(),
    expires_at = now() + (plan_days || ' days')::interval,
    approved_at = now()
  WHERE id = _subscription_id
    AND user_id = _user_id
    AND payment_status = 'pending_activation';
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subscription not found or not in pending_activation status';
  END IF;
END;
$$;

-- Update has_active_subscription to also consider pending_activation as a valid state
-- (user bought but hasn't activated yet - they have access to activate)
