
-- 1. Fix Categories (Column is 'name', not 'title')
INSERT INTO public.categories (id, name, slug, description, active)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ITIL 4 Foundation', 'itil-4-foundation', 'Certificação fundamental em gerenciamento de serviços de TI', true),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'AWS Certified Cloud Practitioner', 'aws-cloud-practitioner', 'Fundamentos de nuvem AWS', true)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    slug = EXCLUDED.slug;

-- 2. Fix Products (Columns corrected to match schema: description, etc.)
-- Schema has: description (text), technology, level, duration_minutes, etc.
-- We map 'short_description' + 'full_description' to just 'description' for now or update schema.
-- Let's stick to the schema: description.

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

-- 3. Ensure Topics exist (Basic set for ITIL)
INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Conceitos-chave de gerenciamento de serviço', '1. Conceitos-chave', 5, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('22222222-2222-2222-2222-222222222222', 'Os princípios orientadores', '2. Princípios Orientadores', 6, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('33333333-3333-3333-3333-333333333333', 'As quatro dimensões do gerenciamento', '3. Quatro Dimensões', 2, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('44444444-4444-4444-4444-444444444444', 'As práticas de gerenciamento da ITIL', '7. Entender 7 Práticas ITIL', 17, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Questions (Sample)
    INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
    VALUES
    ('11111111-1111-1111-1111-111111111111', 'Qual é a definição de "Serviço"?', 
     'Um meio de permitir a cocriação de valor, facilitando os resultados que os clientes desejam alcançar, sem que o cliente tenha que gerenciar custos e riscos específicos.', 
     'Um conjunto de recursos organizacionais especializados para gerar valor para os interessados.', 
     'A funcionalidade de um produto ou serviço para atender a uma necessidade específica.', 
     'Uma configuração de recursos de uma organização, projetada para oferecer valor a um consumidor.', 
     'A', 
     'A definição oficial de Serviço na ITIL 4 é: "Um meio de permitir a cocriação de valor..."', 'standard')
    ON CONFLICT DO NOTHING;
