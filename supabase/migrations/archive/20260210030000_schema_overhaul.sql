-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- CATEGORIES (Technologies)
create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  slug text not null unique,
  name text not null,
  icon text, -- Lucide icon name or image URL
  description text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PRODUCTS (Exam Simulations)
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references public.categories(id),
  slug text not null unique,
  title text not null,
  technology text, -- Can be redundant with category or specific sub-tech
  level text, -- e.g., 'Professional', 'Associate'
  description text,
  features text[], -- Array of feature strings
  price_cents integer not null, -- Store in cents (e.g., 2990 for R$29.90)
  demo_enabled boolean default false,
  demo_limit_questions integer default 10,
  cover_image text,
  question_count integer default 0,
  duration_minutes integer default 60,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ORDERS
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  product_id uuid references public.products(id) not null,
  status text not null check (status in ('PENDING', 'PAID_REVIEW', 'APPROVED', 'REJECTED')),
  amount_cents integer not null,
  customer_name text,
  customer_email text,
  customer_cpf text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ORDER PAYMENTS (Proof)
create table if not exists public.order_payments (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) not null,
  proof_url text, -- URL to storage
  proof_text text, -- Notes or pasted code
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- ENTITLEMENTS (Access)
create table if not exists public.entitlements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  product_id uuid references public.products(id) not null,
  source_order_id uuid references public.orders(id),
  status text not null check (status in ('ACTIVE', 'INACTIVE', 'EXPIRED')),
  starts_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ends_at timestamp with time zone, -- Nullable for lifetime access
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES (Simple version)
alter table public.categories enable row level security;
create policy "Categories are viewable by everyone" on public.categories for select using (true);

alter table public.products enable row level security;
create policy "Products are viewable by everyone" on public.products for select using (true);

alter table public.orders enable row level security;
create policy "Users can view their own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users can create orders" on public.orders for insert with check (auth.uid() = user_id);

alter table public.order_payments enable row level security;
create policy "Users can view own payments" on public.order_payments for select using (exists (select 1 from public.orders where id = order_payments.order_id and user_id = auth.uid()));
create policy "Users can upload payments" on public.order_payments for insert with check (exists (select 1 from public.orders where id = order_payments.order_id and user_id = auth.uid()));

alter table public.entitlements enable row level security;
create policy "Users can view their entitlements" on public.entitlements for select using (auth.uid() = user_id);

-- SEED DATA (Example)
-- We use ON CONFLICT DO NOTHING to avoid errors on re-runs if unique constraints are hit
insert into categories (slug, name, icon) values 
('itil', 'ITIL', 'Library'),
('aws', 'AWS', 'Cloud'),
('azure', 'Microsoft Azure', 'Cloud'),
('scrum', 'Scrum', 'Users')
ON CONFLICT (slug) DO NOTHING;

-- Fetch category IDs for products insertion is tricky in pure SQL without variables in a migration sometimes, 
-- but we can do subqueries.
insert into products (slug, title, technology, level, price_cents, description, demo_enabled, category_id) values
('itil-4-foundation', 'ITIL 4 Foundation Practice Test', 'ITIL', 'Foundation', 4990, 'Complete preparation for ITIL 4 Foundation.', true, (select id from categories where slug='itil')),
('aws-saa-c03', 'AWS Certified Solutions Architect - Associate', 'AWS', 'Associate', 5990, 'Simulado completo para SAA-C03.', true, (select id from categories where slug='aws'))
ON CONFLICT (slug) DO NOTHING;
