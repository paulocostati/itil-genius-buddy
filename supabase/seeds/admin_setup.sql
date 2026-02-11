-- Create the admin function and policy
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean AS $$
BEGIN
  -- For now, we can hardcode your user ID here OR create a proper 'user_roles' table.
  -- Simpler approach: check against a specific email in auth.users
  -- But we can't query auth.users easily from here due to security.
  
  -- SOLUTION: Create a public.user_roles table
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = _role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Roles Table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  role text NOT NULL, -- 'admin'
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
-- Only admins can view roles (chicken and egg, but useful) or users view their own
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- ALLOW ADMIN TO VIEW ALL ORDERS
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT 
USING ( public.has_role(auth.uid(), 'admin') = true );

-- ALLOW ADMIN TO UPDATE ORDERS (Approve)
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE
USING ( public.has_role(auth.uid(), 'admin') = true );

-- ALLOW ADMIN TO VIEW ALL PAYMENTS
CREATE POLICY "Admins can view all payments" ON public.order_payments FOR SELECT
USING ( public.has_role(auth.uid(), 'admin') = true );

-- ALLOW ADMIN TO MANAGE ENTITLEMENTS
CREATE POLICY "Admins can insert entitlements" ON public.entitlements FOR INSERT
WITH CHECK ( public.has_role(auth.uid(), 'admin') = true );
