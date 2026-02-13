import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useSubscription() {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    // Check if user is admin (admins always have access)
    (supabase.rpc as any)('has_role', { _user_id: user.id, _role: 'admin' })
      .then(({ data: isAdmin }: { data: boolean }) => {
        if (isAdmin) {
          setHasAccess(true);
          setLoading(false);
          return;
        }

        // Check active subscription or pending_activation (user has paid but not activated yet)
        (supabase.rpc as any)('has_active_subscription', { _user_id: user.id })
          .then(({ data }: { data: boolean }) => {
            if (data) {
              setHasAccess(true);
              setLoading(false);
              return;
            }
            // Also check pending_activation subscriptions
            (supabase.from as any)('user_subscriptions')
              .select('id')
              .eq('user_id', user.id)
              .eq('payment_status', 'pending_activation')
              .limit(1)
              .then(({ data: pendingSubs }: { data: any[] }) => {
                setHasAccess(!!pendingSubs?.length || false);
                setLoading(false);
              });
          });
      });
  }, [user]);

  return { hasAccess, loading };
}
