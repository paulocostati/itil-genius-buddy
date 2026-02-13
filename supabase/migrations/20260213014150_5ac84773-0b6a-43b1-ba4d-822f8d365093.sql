
-- 1. Vendors table (Microsoft, Axelos, AWS, etc.)
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read vendors" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "Admins can manage vendors" ON public.vendors FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- 2. Categories table (linked to vendor)
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- 3. Products table (linked to category)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  question_count INTEGER NOT NULL DEFAULT 40,
  time_limit_minutes INTEGER NOT NULL DEFAULT 60,
  passing_score INTEGER NOT NULL DEFAULT 65,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_demo_available BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- 4. Add category_id to topics (to isolate by category)
ALTER TABLE public.topics ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- 5. Add product_id and is_demo to exams
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE SET NULL;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;

-- 6. Entitlements table (user access to products)
CREATE TABLE public.entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  source_order_id UUID,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entitlements" ON public.entitlements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage entitlements" ON public.entitlements FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- 7. Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  amount_cents INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- 8. Order payments table
CREATE TABLE public.order_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  proof_text TEXT,
  proof_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.order_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order payments" ON public.order_payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_payments.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users can create own order payments" ON public.order_payments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_payments.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admins can manage order payments" ON public.order_payments FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- 9. Seed initial vendor for ITIL
INSERT INTO public.vendors (name, slug, description) VALUES ('Axelos', 'axelos', 'ITIL 4 e outros frameworks de gerenciamento de serviços');

-- 10. Seed initial category for ITIL 4 Foundation
INSERT INTO public.categories (vendor_id, name, slug, description)
SELECT v.id, 'ITIL 4 Foundation', 'itil-4-foundation', 'Certificação ITIL 4 Foundation'
FROM public.vendors v WHERE v.slug = 'axelos';

-- 11. Link existing topics to the ITIL 4 Foundation category
UPDATE public.topics SET category_id = (SELECT id FROM public.categories WHERE slug = 'itil-4-foundation');

-- 12. Seed initial product
INSERT INTO public.products (category_id, title, slug, description, price_cents, question_count, time_limit_minutes, passing_score, is_demo_available)
SELECT c.id, 'Simulado ITIL 4 Foundation', 'itil-4-foundation', 'Simulado completo com 40 questões no padrão oficial', 4990, 40, 60, 65, true
FROM public.categories c WHERE c.slug = 'itil-4-foundation';
