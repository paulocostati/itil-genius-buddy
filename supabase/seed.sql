-- Categories
INSERT INTO public.categories (id, title, slug, description)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ITIL 4 Foundation', 'itil-4-foundation', 'Certificação fundamental em gerenciamento de serviços de TI'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'AWS Certified Cloud Practitioner', 'aws-cloud-practitioner', 'Fundamentos de nuvem AWS'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Scrum Master', 'scrum-master', 'Certificação ágil para Scrum Masters')
ON CONFLICT (id) DO NOTHING;

-- Products
INSERT INTO public.products (id, title, slug, short_description, full_description, price_cents, category_id, demo_enabled, question_count)
VALUES
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Simulado Completo ITIL 4', 'itil-4-full', 'Mais de 500 questões comentadas para sua aprovação.', 'Acesso vitalício a todo o banco de questões ITIL 4, com explicações detalhadas e modo simulado real.', 4990, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, 40),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Simulado AWS Cloud', 'aws-cloud-full', 'Prepare-se para a nuvem com 300 questões práticas.', 'Domine os conceitos de nuvem AWS com nosso banco de questões atualizado.', 5990, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, 65)
ON CONFLICT (id) DO NOTHING;

-- Topics (Basic set for ITIL)
INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES
  (uuid_generate_v4(), 'Conceitos-chave de gerenciamento de serviço', '1. Conceitos-chave', 5, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  (uuid_generate_v4(), 'Os quatro dimensões do gerenciamento de serviço', '3. Quatro Dimensões', 2, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  (uuid_generate_v4(), 'O sistema de valor de serviço da ITIL', '4. Sistema de Valor (SVS)', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  (uuid_generate_v4(), 'As práticas de gerenciamento da ITIL', '7. Entender 7 Práticas ITIL', 17, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT DO NOTHING;

-- Questions (Sample for demo)
-- Note: UUIDs generated dynamically in real usage, hardcoding here for simplicity if needed or rely on app imports.
-- For a robust seed, we'd add questions here too, but it's verbose. 
-- The user likely has some questions or can add via admin later (if admin features built).
