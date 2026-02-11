-- 1. CLEANUP (Optional, be careful if preserving data)
-- DROP TABLE IF EXISTS public.exam_questions CASCADE;
-- DROP TABLE IF EXISTS public.exams CASCADE;
-- DROP TABLE IF EXISTS public.questions CASCADE;
-- DROP TABLE IF EXISTS public.topics CASCADE;
-- DROP TABLE IF EXISTS public.entitlements CASCADE;
-- DROP TABLE IF EXISTS public.order_payments CASCADE;
-- DROP TABLE IF EXISTS public.orders CASCADE;
-- DROP TABLE IF EXISTS public.products CASCADE;
-- DROP TABLE IF EXISTS public.categories CASCADE;

-- 2. SCHEMA SETUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  icon text,
  description text,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id uuid REFERENCES public.categories(id),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  technology text,
  level text,
  description text,
  features text[],
  price_cents integer NOT NULL,
  demo_enabled boolean DEFAULT false,
  demo_limit_questions integer DEFAULT 10,
  cover_image text,
  question_count integer DEFAULT 0,
  duration_minutes integer DEFAULT 60,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  product_id uuid REFERENCES public.products(id) NOT NULL,
  status text NOT NULL CHECK (status IN ('PENDING', 'PAID_REVIEW', 'APPROVED', 'REJECTED')),
  amount_cents integer NOT NULL,
  customer_name text,
  customer_email text,
  customer_cpf text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Order Payments
CREATE TABLE IF NOT EXISTS public.order_payments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) NOT NULL,
  proof_url text,
  proof_text text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Entitlements
CREATE TABLE IF NOT EXISTS public.entitlements (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  product_id uuid REFERENCES public.products(id) NOT NULL,
  source_order_id uuid REFERENCES public.orders(id),
  status text NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE', 'EXPIRED')),
  starts_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  ends_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Topics
CREATE TABLE IF NOT EXISTS public.topics (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  area text,
  weight integer DEFAULT 1,
  category_id uuid REFERENCES public.categories(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Questions
CREATE TABLE IF NOT EXISTS public.questions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  topic_id uuid REFERENCES public.topics(id) NOT NULL,
  statement text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_option text NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  explanation text,
  question_type text DEFAULT 'standard',
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Exams
CREATE TABLE IF NOT EXISTS public.exams (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  total_questions integer NOT NULL,
  score integer,
  completed boolean DEFAULT false,
  started_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  finished_at timestamp with time zone,
  product_id uuid REFERENCES public.products(id),
  is_demo boolean DEFAULT false
);

-- Exam Questions
CREATE TABLE IF NOT EXISTS public.exam_questions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  exam_id uuid REFERENCES public.exams(id) NOT NULL,
  question_id uuid REFERENCES public.questions(id) NOT NULL,
  selected_option text CHECK (selected_option IN ('A', 'B', 'C', 'D')),
  is_correct boolean,
  answered_at timestamp with time zone,
  question_order integer NOT NULL
);

-- 3. ENABLE RLS & POLICIES

-- Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

-- Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);

-- Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order Payments
ALTER TABLE public.order_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own payments" ON public.order_payments;
CREATE POLICY "Users can view own payments" ON public.order_payments FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_payments.order_id AND user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can upload payments" ON public.order_payments;
CREATE POLICY "Users can upload payments" ON public.order_payments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE id = order_payments.order_id AND user_id = auth.uid()));

-- Entitlements
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their entitlements" ON public.entitlements;
CREATE POLICY "Users can view their entitlements" ON public.entitlements FOR SELECT USING (auth.uid() = user_id);

-- Topics
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Topics active are viewable" ON public.topics;
CREATE POLICY "Topics active are viewable" ON public.topics FOR SELECT USING (true);

-- Questions
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Questions active are viewable" ON public.questions;
CREATE POLICY "Questions active are viewable" ON public.questions FOR SELECT USING (active = true);

-- Exams
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own exams" ON public.exams;
CREATE POLICY "Users view own exams" ON public.exams FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users create exams" ON public.exams;
CREATE POLICY "Users create exams" ON public.exams FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own exams" ON public.exams;
CREATE POLICY "Users update own exams" ON public.exams FOR UPDATE USING (auth.uid() = user_id);

-- Exam Questions
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own exam questions" ON public.exam_questions;
CREATE POLICY "Users view own exam questions" ON public.exam_questions FOR SELECT USING (EXISTS (SELECT 1 FROM public.exams WHERE id = exam_questions.exam_id AND user_id = auth.uid()));
DROP POLICY IF EXISTS "Users insert exam questions" ON public.exam_questions;
CREATE POLICY "Users insert exam questions" ON public.exam_questions FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.exams WHERE id = exam_questions.exam_id AND user_id = auth.uid()));
DROP POLICY IF EXISTS "Users update exam questions" ON public.exam_questions;
CREATE POLICY "Users update exam questions" ON public.exam_questions FOR UPDATE USING (EXISTS (SELECT 1 FROM public.exams WHERE id = exam_questions.exam_id AND user_id = auth.uid()));

-- 4. INSERT DATA
-- Insert Categories
INSERT INTO public.categories (id, name, slug, description, active)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ITIL 4 Foundation', 'itil-4-foundation', 'Certificação fundamental em gerenciamento de serviços de TI', true),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'AWS Certified Cloud Practitioner', 'aws-cloud-practitioner', 'Fundamentos de nuvem AWS', true)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    slug = EXCLUDED.slug;

-- Insert Products
INSERT INTO public.products (id, title, slug, description, price_cents, category_id, demo_enabled, question_count, technology, level, duration_minutes, active)
VALUES
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 
   'Simulado Oficial ITIL 4 Foundation', 
   'itil-4-foundation-exam', 
   'Prepare-se para a certificação ITIL 4 Foundation com nosso simulado completo. Cobre todos os tópicos do exame: Princípios Orientadores, 4 Dimensões, SVS e Práticas.', 
   4990, 
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
   true, 
   40,
   'IT Service Management',
   'Foundation',
   60,
   true
  )
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    active = true,
    category_id = EXCLUDED.category_id;

-- Insert Topics (Base ones, user import adds more)
INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Conceitos-chave de gerenciamento de serviço', '1. Conceitos-chave', 5, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('22222222-2222-2222-2222-222222222222', 'Os princípios orientadores', '2. Princípios Orientadores', 6, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('33333333-3333-3333-3333-333333333333', 'As quatro dimensões do gerenciamento', '3. Quatro Dimensões', 2, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('44444444-4444-4444-4444-444444444444', 'As práticas de gerenciamento da ITIL', '7. Entender 7 Práticas ITIL', 17, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

-- Insert Questions (Samples)
INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES
 ('11111111-1111-1111-1111-111111111111', 'Qual é a definição de "Serviço"?', 
  'Um meio de permitir a cocriação de valor, facilitando os resultados que os clientes desejam alcançar, sem que o cliente tenha que gerenciar custos e riscos específicos.', 
  'Um conjunto de recursos organizacionais especializados para gerar valor para os interessados.', 
  'A funcionalidade de um produto ou serviço para atender a uma necessidade específica.', 
  'Uma configuração de recursos de uma organização, projetada para oferecer valor a um consumidor.', 
  'A', 
  'A definição oficial de Serviço na ITIL 4 é: "Um meio de permitir a cocriação de valor..."', 'standard'),
 ('11111111-1111-1111-1111-111111111111', 'O que é "Utilidade"?',
  'A garantia de que um produto ou serviço atenderá aos requisitos acordados.',
  'A funcionalidade de um produto ou serviço para atender a uma necessidade específica.',
  'A quantidade de dinheiro gasta em uma atividade ou recurso específico.',
  'Um possível evento futuro que pode causar danos ou perdas.',
  'B',
  'Utilidade é a funcionalidade oferecida por um produto ou serviço para atender a uma necessidade específica.', 'standard')
ON CONFLICT DO NOTHING;
