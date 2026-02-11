
-- IMPORT ITIL QUESTIONS
-- 1. Insert Topics

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('1929c904-00b3-4a84-8748-d7b5b8c872fc', 'Começar de onde você está', 'Princípios Orientadores ITIL', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('be8db4ef-414e-44c8-b96b-5e53f49b80be', 'Habilitação de mudança', 'Práticas ITIL', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('dd24b2f9-9314-43c3-9795-ff798686ebd5', 'Central de serviço', 'Práticas ITIL', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('2f4712e4-722f-463c-ac05-7ac80fae97a9', 'Garantia', 'Conceitos-chave', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('b3a60501-f3bb-47af-947f-98e8a94710d4', 'Provisão de serviço', 'Conceitos-chave', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('736d6bab-c011-4ca5-bc2c-93520bec3c05', 'Melhoria contínua', 'Práticas ITIL', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('4678a9fc-1a46-424b-8930-057dd43cd6d0', 'Atividades da cadeia de valor', 'Cadeia de Valor de Serviço', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('a2c1f35a-5815-490b-8ec4-e6252e12180b', 'Resultado e saída', 'Conceitos-chave', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('7af37568-1b78-4475-8b36-5cb3b5de187d', 'Gerenciamento de incidente', 'Práticas ITIL', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('d3868c7f-e411-423b-a216-cb61825e8615', 'Desenho e transição', 'Cadeia de Valor de Serviço', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('7f01afcb-2e01-419f-a6a3-2206662635c6', 'Gerenciamento de requisição de serviço', 'Práticas ITIL', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('6951bbbc-6789-4418-beb2-69928e90161f', 'Componentes do SVS', 'Sistema de Valor de Serviço', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('971a0843-5b8e-4ea1-9758-2d9a0967d36b', 'Gerenciamento de problema', 'Práticas ITIL', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('0c52492f-bba3-48c0-b673-6773f049f915', 'Manter de forma simples e prática', 'Princípios Orientadores ITIL', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('443d446b-5454-4a2c-99ca-56ffe152746b', 'Informação e tecnologia', 'Quatro Dimensões', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('49e81ea4-5dd4-4ec2-866c-9d08bf56f5e6', 'Serviço', 'Conceitos-chave', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('2605ae86-6c0d-484d-9df8-8eea14ac1a8a', 'Uso dos princípios orientadores', 'Princípios Orientadores ITIL', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('77f2ce11-8a25-4121-b6b2-92aff805de6c', 'Progredir iterativamente com feedback', 'Princípios Orientadores ITIL', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('29c2ba9d-2724-4438-bb3d-e6650dd7247d', 'Gerenciamento de implantação', 'Práticas ITIL', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('c5153aea-a5e9-429c-a861-9fa70cd667f6', 'Gerenciamento de fornecedor', 'Práticas ITIL', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('716c75a0-9bcf-4a5b-9f89-b698cb115ce8', 'Foco no valor', 'Princípios Orientadores ITIL', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('af5ea2d3-b7ba-4aef-b98d-dedcfc7c925e', 'Otimizar e automatizar', 'Princípios Orientadores ITIL', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('fbe587af-dc66-417d-bb5e-1a5526fe0f60', 'Gerenciamento de nível de serviço', 'Práticas ITIL', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('a0b512f9-252e-4588-a8a5-eb9182ad2ace', 'Risco', 'Conceitos-chave', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('223e8bfb-79bd-4b04-a3e2-ec14b76ec628', 'Organizações e pessoas', 'Quatro Dimensões', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('5457a951-0125-46e0-aeb1-eb7fd163862d', 'Gerenciamento de configuração de serviço', 'Práticas ITIL', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('0ec21505-1a43-4e1a-9d5b-afa2e95b6bbf', 'SVS', 'Sistema de Valor de Serviço', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('440409d0-a745-4877-97b2-a1beca7556e4', 'Utilidade', 'Conceitos-chave', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('3dc9261f-ebdb-46f3-b4a6-ce1ed6c9f26e', 'Oferta de serviço', 'Conceitos-chave', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('93d577e2-25d2-4111-be6f-c1dca3b9e55f', 'Obtenção/Construção', 'Cadeia de Valor de Serviço', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('fa1e6cff-2957-4962-8f96-cd969b51e262', 'Colaborar e promover visibilidade', 'Princípios Orientadores ITIL', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('af73570f-61a6-4af5-b532-d1a3002992e0', 'Monitoramento e gerenciamento de evento', 'Práticas ITIL', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('2985c412-917b-4723-9d68-f36f032150aa', 'Mudança padrão', 'Práticas ITIL', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('b79860cc-a1d5-4bdc-b863-9dce633a5dac', 'Cliente', 'Conceitos-chave', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('5f4266bc-2237-4341-9bec-12c431922667', 'Relacionamento de serviço', 'Conceitos-chave', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('a5e816c1-5a52-4685-89d2-a5cfe7f8450c', 'Mudança normal', 'Práticas ITIL', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('e6432e62-93dc-4ef6-8c1d-d80d4f9244bb', 'Valor', 'Conceitos-chave', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (id, name, area, weight, category_id)
VALUES ('975d4fd0-e888-4af8-8185-3deb97ab9f06', 'Resultados', 'Conceitos-chave', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Questions

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '1929c904-00b3-4a84-8748-d7b5b8c872fc',
  'Qual princípio orientador recomenda o uso de serviços, processos e ferramentas existentes para melhorar os serviços?',
  'Equipe de suporte capacitada',
  'A avaliação e autorização são agilizadas para garantir implementação rápida',
  'Manter de forma simples e prática',
  'Começar de onde você está',
  'D',
  'Resposta correta: Começar de onde você está',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  'be8db4ef-414e-44c8-b96b-5e53f49b80be',
  'Qual prática garante que os riscos sejam adequadamente avaliados?',
  'Habilidades de comunicação e análise de incidentes',
  'Habilitação de mudança',
  'Um processo separado',
  'Serviços',
  'B',
  'Resposta correta: Habilitação de mudança',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  'be8db4ef-414e-44c8-b96b-5e53f49b80be',
  'Quando se deve realizar uma avaliação de risco completa para uma mudança padrão?',
  'Quando o procedimento para mudança padrão é criado',
  'Decidir quais requisições exigem aprovação',
  'Obtenção/Construção',
  'Métricas vinculadas a resultados definidos',
  'A',
  'Resposta correta: Quando o procedimento para mudança padrão é criado',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  'be8db4ef-414e-44c8-b96b-5e53f49b80be',
  'Qual afirmação sobre mudanças emergenciais está correta?',
  'A avaliação e autorização são agilizadas para garantir implementação rápida',
  'Obtenção/Construção',
  'Habilitação de mudança',
  'Central de serviço',
  'A',
  'Resposta correta: A avaliação e autorização são agilizadas para garantir implementação rápida',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  'dd24b2f9-9314-43c3-9795-ff798686ebd5',
  'Qual prática coordena classificação, propriedade e comunicação de incidentes e requisições?',
  'Gerenciamento de fornecedor',
  'Otimizar e automatizar',
  'Central de serviço',
  'Um serviço',
  'C',
  'Resposta correta: Central de serviço',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '2f4712e4-722f-463c-ac05-7ac80fae97a9',
  'O que é garantia?',
  'Serviços',
  'A avaliação e autorização são agilizadas para garantir implementação rápida',
  'Manter o foco no valor em cada etapa da melhoria',
  'Confirmação de que um produto ou serviço atenderá aos requisitos acordados',
  'D',
  'Resposta correta: Confirmação de que um produto ou serviço atenderá aos requisitos acordados',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  'b3a60501-f3bb-47af-947f-98e8a94710d4',
  'O que inclui o termo provisão de serviço?',
  'Mudança que precisa ser programada e avaliada seguindo processo',
  'Gerenciamento de recursos configurados para entregar o serviço',
  'Habilitação de mudança',
  'Habilidades de comunicação e análise de incidentes',
  'B',
  'Resposta correta: Gerenciamento de recursos configurados para entregar o serviço',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '736d6bab-c011-4ca5-bc2c-93520bec3c05',
  'O que é correto sobre o registro de melhoria contínua (RMC)?',
  'A avaliação e autorização são agilizadas para garantir implementação rápida',
  'Habilidades de comunicação e análise de incidentes',
  'Gerente de nível de serviço',
  'Deve ser priorizado conforme ideias são documentadas',
  'D',
  'Resposta correta: Deve ser priorizado conforme ideias são documentadas',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '4678a9fc-1a46-424b-8930-057dd43cd6d0',
  'O que são envolver, planejar e melhorar?',
  'Atividades da cadeia de valor de serviço',
  'Provedores ajudam consumidores a atingir resultados',
  'A avaliação e autorização são agilizadas para garantir implementação rápida',
  'Desempenho',
  'A',
  'Resposta correta: Atividades da cadeia de valor de serviço',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  'a2c1f35a-5815-490b-8ec4-e6252e12180b',
  'Qual afirmativa sobre resultados é correta?',
  'Central de serviço',
  'Atender continuamente às expectativas das partes interessadas em relação aos custos',
  'O mesmo produto pode ser base para mais de uma oferta de serviço',
  'Um resultado pode ser ativado por mais de uma saída',
  'D',
  'Resposta correta: Um resultado pode ser ativado por mais de uma saída',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  'dd24b2f9-9314-43c3-9795-ff798686ebd5',
  'Qual afirmativa sobre a central de serviço está correta?',
  'A central de serviço deve trabalhar em estreita colaboração com equipes de suporte e desenvolvimento',
  'Deve ser escrito de modo simples e fácil de entender',
  'Comunicando restrições',
  'Melhoria contínua',
  'A',
  'Resposta correta: A central de serviço deve trabalhar em estreita colaboração com equipes de suporte e desenvolvimento',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '7af37568-1b78-4475-8b36-5cb3b5de187d',
  'Qual prática atualiza informações relacionadas a sintomas e impacto nos negócios?',
  'Gerenciamento de incidente',
  'Erros conhecidos',
  'Consumidor e provedor',
  'Possibilitam diagnóstico rápido e eficiente',
  'A',
  'Resposta correta: Gerenciamento de incidente',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  'd3868c7f-e411-423b-a216-cb61825e8615',
  'O que está incluído no objetivo da atividade de desenho e transição?',
  'Decidir quais requisições exigem aprovação',
  'Atender continuamente às expectativas das partes interessadas em relação aos custos',
  'Central de serviço',
  'Item de configuração',
  'B',
  'Resposta correta: Atender continuamente às expectativas das partes interessadas em relação aos custos',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '7f01afcb-2e01-419f-a6a3-2206662635c6',
  'Qual prática tem o objetivo de manipular todos os serviços acordados e iniciados pelo usuário?',
  'Gerenciamento de requisição de serviço',
  'Informação e tecnologia',
  'Implantar componentes novos ou modificados em ambientes de produção',
  'Modelo de melhoria contínua',
  'A',
  'Resposta correta: Gerenciamento de requisição de serviço',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '6951bbbc-6789-4418-beb2-69928e90161f',
  'Qual NÃO é um componente do sistema de valor de serviço?',
  'Implantar componentes novos ou modificados em ambientes de produção',
  'As quatro dimensões do gerenciamento de serviço',
  'Gerente de nível de serviço',
  'Gerenciamento de incidente',
  'B',
  'Resposta correta: As quatro dimensões do gerenciamento de serviço',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '7f01afcb-2e01-419f-a6a3-2206662635c6',
  'Qual afirmativa sobre etapas para atender a uma requisição de serviço está correta?',
  'Devem ser bem conhecidas e comprovadas',
  'Habilitação de mudança',
  'Alcançar resultados desejados',
  'Cada iteração deve ser continuamente reavaliada com base no feedback',
  'A',
  'Resposta correta: Devem ser bem conhecidas e comprovadas',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '971a0843-5b8e-4ea1-9758-2d9a0967d36b',
  'Qual é definido como causa real ou potencial de um ou mais incidentes?',
  'Problema',
  'Comunicando restrições',
  'Provedores ajudam consumidores a atingir resultados',
  'Controle de problemas',
  'A',
  'Resposta correta: Problema',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '0c52492f-bba3-48c0-b673-6773f049f915',
  'Qual princípio orientador recomenda a eliminação de atividades que não contribuem para a criação de valor?',
  'Cliente',
  'Sistema de Valor de Serviço',
  'Desenvolver competências em metodologias e técnicas adequadas às necessidades da organização',
  'Manter de forma simples e prática',
  'D',
  'Resposta correta: Manter de forma simples e prática',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '971a0843-5b8e-4ea1-9758-2d9a0967d36b',
  'Quando a eficácia de uma solução alternativa deve ser avaliada?',
  'Habilidades de comunicação e análise de incidentes',
  'Decidir quais requisições exigem aprovação',
  'Sempre que a solução alternativa for usada',
  'Cliente',
  'C',
  'Resposta correta: Sempre que a solução alternativa for usada',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  'be8db4ef-414e-44c8-b96b-5e53f49b80be',
  'Uma mudança é definida como uma adição, modificação ou remoção de qualquer coisa que possa ter efeito direto ou indireto sobre [?].',
  'Equipe de suporte capacitada',
  'Gerente de nível de serviço',
  'Solicitação de informações, aconselhamento ou acesso a um serviço',
  'Serviços',
  'D',
  'Resposta correta: Serviços',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '443d446b-5454-4a2c-99ca-56ffe152746b',
  'Qual dimensão considera o modo como os ativos de conhecimento devem ser protegidos?',
  'Informação e tecnologia',
  'Gerenciamento de requisição de serviço',
  'Atender continuamente às expectativas das partes interessadas em relação aos custos',
  'Gerenciamento de problema',
  'A',
  'Resposta correta: Informação e tecnologia',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '49e81ea4-5dd4-4ec2-866c-9d08bf56f5e6',
  'O que é um meio de permitir a cocriação de valor ao facilitar a obtenção de resultados sem que o cliente gerencie custos e riscos específicos?',
  'Um serviço',
  'Possibilitam diagnóstico rápido e eficiente',
  'Uso de roteiros',
  'Para ajudar uma organização na tomada de boas decisões',
  'A',
  'Resposta correta: Um serviço',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '7af37568-1b78-4475-8b36-5cb3b5de187d',
  'O gerenciamento de incidentes de segurança da informação geralmente requer [?].',
  'A avaliação e autorização são agilizadas para garantir implementação rápida',
  'Um processo separado',
  'Implantar componentes novos ou modificados em ambientes de produção',
  'Gerenciamento de problema',
  'B',
  'Resposta correta: Um processo separado',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '2605ae86-6c0d-484d-9df8-8eea14ac1a8a',
  'Para que são utilizados os princípios orientadores do ITIL?',
  'Atividades da cadeia de valor de serviço',
  'Central de serviço',
  'Para ajudar uma organização na tomada de boas decisões',
  'Otimizar e automatizar',
  'C',
  'Resposta correta: Para ajudar uma organização na tomada de boas decisões',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '77f2ce11-8a25-4121-b6b2-92aff805de6c',
  'Qual é a abordagem correta para gerenciar uma grande iniciativa de melhoria como iterações menores?',
  'Modelo de melhoria contínua',
  'Cada iteração deve ser continuamente reavaliada com base no feedback',
  'Solicitação de acesso a um arquivo',
  'Devem ser bem conhecidas e comprovadas',
  'B',
  'Resposta correta: Cada iteração deve ser continuamente reavaliada com base no feedback',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '29c2ba9d-2724-4438-bb3d-e6650dd7247d',
  'Qual é o propósito da prática de gerenciamento de implantação?',
  'Monitoramento e gerenciamento de evento',
  'Melhoria contínua',
  'Habilitação de mudança',
  'Implantar componentes novos ou modificados em ambientes de produção',
  'D',
  'Resposta correta: Implantar componentes novos ou modificados em ambientes de produção',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '7f01afcb-2e01-419f-a6a3-2206662635c6',
  'O que é uma requisição de serviço?',
  'Atender continuamente às expectativas das partes interessadas em relação aos custos',
  'Modelo de melhoria contínua',
  'Sistema de Valor de Serviço',
  'Solicitação de informações, aconselhamento ou acesso a um serviço',
  'D',
  'Resposta correta: Solicitação de informações, aconselhamento ou acesso a um serviço',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  'c5153aea-a5e9-429c-a861-9fa70cd667f6',
  'O propósito do gerenciamento de fornecedor é garantir que os fornecedores e o [?] deles sejam gerenciados adequadamente.',
  'Para ajudar uma organização na tomada de boas decisões',
  'Habilidades de comunicação e análise de incidentes',
  'Gerenciamento de recursos configurados para entregar o serviço',
  'Desempenho',
  'D',
  'Resposta correta: Desempenho',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '716c75a0-9bcf-4a5b-9f89-b698cb115ce8',
  'Qual recomendação está relacionada ao princípio orientador ''Foco no valor''?',
  'Um processo separado',
  'Manter o foco no valor em cada etapa da melhoria',
  'Utilidade',
  'Comunicando restrições',
  'B',
  'Resposta correta: Manter o foco no valor em cada etapa da melhoria',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  'af5ea2d3-b7ba-4aef-b98d-dedcfc7c925e',
  'Qual princípio orientador recomenda padronizar e otimizar tarefas manuais antes de automatizá-las?',
  'Desenvolver competências em metodologias e técnicas adequadas às necessidades da organização',
  'Solicitação de informações, aconselhamento ou acesso a um serviço',
  'Otimizar e automatizar',
  'Devem ser bem conhecidas e comprovadas',
  'C',
  'Resposta correta: Otimizar e automatizar',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '736d6bab-c011-4ca5-bc2c-93520bec3c05',
  'O que descreve um conjunto de etapas definidas para implementar melhorias?',
  'Modelo de melhoria contínua',
  'Deve ser escrito de modo simples e fácil de entender',
  'Manter de forma simples e prática',
  'Colaborar e promover visibilidade',
  'A',
  'Resposta correta: Modelo de melhoria contínua',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  'fbe587af-dc66-417d-bb5e-1a5526fe0f60',
  'Qual é o principal requisito para um acordo de nível de serviço (ANS) de sucesso?',
  'Desempenho',
  'Deve ser escrito de modo simples e fácil de entender',
  'Quando o procedimento para mudança padrão é criado',
  'Atender continuamente às expectativas das partes interessadas em relação aos custos',
  'B',
  'Resposta correta: Deve ser escrito de modo simples e fácil de entender',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '736d6bab-c011-4ca5-bc2c-93520bec3c05',
  'Ao planejar a melhoria contínua, qual abordagem deve ser usada para avaliar o estado atual?',
  'Um resultado pode ser ativado por mais de uma saída',
  'Serviços',
  'Habilidades de comunicação e análise de incidentes',
  'Desenvolver competências em metodologias e técnicas adequadas às necessidades da organização',
  'D',
  'Resposta correta: Desenvolver competências em metodologias e técnicas adequadas às necessidades da organização',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  'a0b512f9-252e-4588-a8a5-eb9182ad2ace',
  'Como um consumidor de serviço contribui para a redução de risco?',
  'Começar de onde você está',
  'Um processo separado',
  'Sempre que a solução alternativa for usada',
  'Comunicando restrições',
  'D',
  'Resposta correta: Comunicando restrições',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '7af37568-1b78-4475-8b36-5cb3b5de187d',
  'O que ajuda a diagnosticar e resolver um incidente simples?',
  'Uso de roteiros',
  'Otimizar e automatizar',
  'É criada a partir de valores compartilhados e deve basear-se nos objetivos da organização',
  'Manter o foco no valor em cada etapa da melhoria',
  'A',
  'Resposta correta: Uso de roteiros',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '971a0843-5b8e-4ea1-9758-2d9a0967d36b',
  'Qual prática tem o propósito de reduzir a probabilidade de incidentes?',
  'Gerenciamento de recursos configurados para entregar o serviço',
  'Gerenciamento de problema',
  'Deve ser escrito de modo simples e fácil de entender',
  'Item de configuração',
  'B',
  'Resposta correta: Gerenciamento de problema',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  'fbe587af-dc66-417d-bb5e-1a5526fe0f60',
  'Quais são as melhores métricas de nível de serviço para medir a experiência do usuário?',
  'Confirmação de que um produto ou serviço atenderá aos requisitos acordados',
  'Habilitação de mudança',
  'Métricas vinculadas a resultados definidos',
  'Otimizar e automatizar',
  'C',
  'Resposta correta: Métricas vinculadas a resultados definidos',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  'dd24b2f9-9314-43c3-9795-ff798686ebd5',
  'Quais são as qualificações mais importantes para a equipe da central de serviço?',
  'Habilidades de comunicação e análise de incidentes',
  'A central de serviço deve trabalhar em estreita colaboração com equipes de suporte e desenvolvimento',
  'Item de configuração',
  'Gerenciamento de requisição de serviço',
  'A',
  'Resposta correta: Habilidades de comunicação e análise de incidentes',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '223e8bfb-79bd-4b04-a3e2-ec14b76ec628',
  'Quais afirmações sobre a cultura organizacional são corretas?',
  'As quatro dimensões do gerenciamento de serviço',
  'O mesmo produto pode ser base para mais de uma oferta de serviço',
  'Atender continuamente às expectativas das partes interessadas em relação aos custos',
  'É criada a partir de valores compartilhados e deve basear-se nos objetivos da organização',
  'D',
  'Resposta correta: É criada a partir de valores compartilhados e deve basear-se nos objetivos da organização',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  'be8db4ef-414e-44c8-b96b-5e53f49b80be',
  'Quando uma requisição de mudança deve ser enviada para resolver um problema?',
  'Gerenciamento de incidente',
  'Quando a análise de custo, risco e benefício justificar a mudança',
  'Problema',
  'Implantar componentes novos ou modificados em ambientes de produção',
  'B',
  'Resposta correta: Quando a análise de custo, risco e benefício justificar a mudança',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '7af37568-1b78-4475-8b36-5cb3b5de187d',
  'Qual prática minimiza o impacto nas operações normais por meio do gerenciamento de recursos em resposta a reduções não planejadas na qualidade do serviço?',
  'Gerente de nível de serviço',
  'Gerenciamento de incidente',
  'Cada iteração deve ser continuamente reavaliada com base no feedback',
  'Sistema de Valor de Serviço',
  'B',
  'Resposta correta: Gerenciamento de incidente',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '7af37568-1b78-4475-8b36-5cb3b5de187d',
  'Qual é o melhor tipo de recurso para investigação de incidentes complexos?',
  'Otimizar e automatizar',
  'Sistema de Valor de Serviço',
  'Equipe de suporte capacitada',
  'Começar de onde você está',
  'C',
  'Resposta correta: Equipe de suporte capacitada',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '7f01afcb-2e01-419f-a6a3-2206662635c6',
  'Quais decisões no gerenciamento de requisição de serviço exigem que políticas sejam estabelecidas?',
  'Decidir quais requisições exigem aprovação',
  'Serviços',
  'Quando o procedimento para mudança padrão é criado',
  'Erros conhecidos',
  'A',
  'Resposta correta: Decidir quais requisições exigem aprovação',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '0c52492f-bba3-48c0-b673-6773f049f915',
  'Qual princípio orientador recomenda eliminar trabalho desnecessário?',
  'Manter de forma simples e prática',
  'Sempre que a solução alternativa for usada',
  'Mudança padrão',
  'Um resultado pode ser ativado por mais de uma saída',
  'A',
  'Resposta correta: Manter de forma simples e prática',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '736d6bab-c011-4ca5-bc2c-93520bec3c05',
  'Qual prática faz uso de métodos Lean, Agile e DevOps?',
  'Quando o procedimento para mudança padrão é criado',
  'Desempenho',
  'Gerenciamento de recursos configurados para entregar o serviço',
  'Melhoria contínua',
  'D',
  'Resposta correta: Melhoria contínua',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '7f01afcb-2e01-419f-a6a3-2206662635c6',
  'Qual é um exemplo de requisição de serviço?',
  'Solicitação de acesso a um arquivo',
  'Otimizar e automatizar',
  'Um resultado pode ser ativado por mais de uma saída',
  'Deve ser escrito de modo simples e fácil de entender',
  'A',
  'Resposta correta: Solicitação de acesso a um arquivo',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '5457a951-0125-46e0-aeb1-eb7fd163862d',
  'O propósito do gerenciamento de configuração de serviço é garantir informações precisas sobre configuração dos [?] e dos itens que suportam os serviços.',
  'Confirmação de que um produto ou serviço atenderá aos requisitos acordados',
  'Começar de onde você está',
  'Para ajudar uma organização na tomada de boas decisões',
  'Serviços',
  'D',
  'Resposta correta: Serviços',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '0ec21505-1a43-4e1a-9d5b-afa2e95b6bbf',
  'O que inclui a configuração de componentes e atividades para promover resultados para as partes interessadas?',
  'Equipe de suporte capacitada',
  'É criada a partir de valores compartilhados e deve basear-se nos objetivos da organização',
  'Sistema de Valor de Serviço',
  'Gerenciamento de requisição de serviço',
  'C',
  'Resposta correta: Sistema de Valor de Serviço',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  'be8db4ef-414e-44c8-b96b-5e53f49b80be',
  'Qual prática tem como propósito maximizar o número de mudanças bem-sucedidas?',
  'Erros conhecidos',
  'Quando a análise de custo, risco e benefício justificar a mudança',
  'Habilitação de mudança',
  'Gerenciamento de requisição de serviço',
  'C',
  'Resposta correta: Habilitação de mudança',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '440409d0-a745-4877-97b2-a1beca7556e4',
  'Qual termo é usado para descrever a funcionalidade de um serviço?',
  'Um serviço',
  'Confirmação de que um produto ou serviço atenderá aos requisitos acordados',
  'Utilidade',
  'Para ajudar uma organização na tomada de boas decisões',
  'C',
  'Resposta correta: Utilidade',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  'c5153aea-a5e9-429c-a861-9fa70cd667f6',
  'Qual prática cria relacionamentos mais próximos e colaborativos com fornecedores?',
  'Gerenciamento de fornecedor',
  'Quando a análise de custo, risco e benefício justificar a mudança',
  'Deve ser priorizado conforme ideias são documentadas',
  'O mesmo produto pode ser base para mais de uma oferta de serviço',
  'A',
  'Resposta correta: Gerenciamento de fornecedor',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '971a0843-5b8e-4ea1-9758-2d9a0967d36b',
  'Qual fase do gerenciamento de problema inclui avaliação da efetividade de soluções de contorno?',
  'Um processo separado',
  'Monitoramento e gerenciamento de evento',
  'A avaliação e autorização são agilizadas para garantir implementação rápida',
  'Controle de problemas',
  'D',
  'Resposta correta: Controle de problemas',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '7f01afcb-2e01-419f-a6a3-2206662635c6',
  'Qual prática contribui quando um usuário pergunta como criar um relatório?',
  'Gerenciamento de incidente',
  'Provedores ajudam consumidores a atingir resultados',
  'Uso de roteiros',
  'Gerenciamento de requisição de serviço',
  'D',
  'Resposta correta: Gerenciamento de requisição de serviço',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '5457a951-0125-46e0-aeb1-eb7fd163862d',
  'O que é definido como qualquer componente que precisa ser gerenciado para entregar um serviço?',
  'Gerenciamento de problema',
  'Modelo de melhoria contínua',
  'Consumidor e provedor',
  'Item de configuração',
  'D',
  'Resposta correta: Item de configuração',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '3dc9261f-ebdb-46f3-b4a6-ce1ed6c9f26e',
  'Qual afirmativa sobre ofertas de serviço está correta?',
  'Desenvolver competências em metodologias e técnicas adequadas às necessidades da organização',
  'Métricas vinculadas a resultados definidos',
  'Monitoramento e gerenciamento de evento',
  'O mesmo produto pode ser base para mais de uma oferta de serviço',
  'D',
  'Resposta correta: O mesmo produto pode ser base para mais de uma oferta de serviço',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '971a0843-5b8e-4ea1-9758-2d9a0967d36b',
  'O propósito do gerenciamento de problema inclui gerenciar soluções de contorno e [?].',
  'Atividades da cadeia de valor de serviço',
  'Devem ser bem conhecidas e comprovadas',
  'Para ajudar uma organização na tomada de boas decisões',
  'Erros conhecidos',
  'D',
  'Resposta correta: Erros conhecidos',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '971a0843-5b8e-4ea1-9758-2d9a0967d36b',
  'Uma falha sendo analisada ativamente é classificada como?',
  'As quatro dimensões do gerenciamento de serviço',
  'Cada iteração deve ser continuamente reavaliada com base no feedback',
  'Problema',
  'Monitoramento e gerenciamento de evento',
  'C',
  'Resposta correta: Problema',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  'dd24b2f9-9314-43c3-9795-ff798686ebd5',
  'Qual prática está mais associada ao uso de empatia para entender usuários?',
  'Central de serviço',
  'Deve ser escrito de modo simples e fácil de entender',
  'Um resultado pode ser ativado por mais de uma saída',
  'Métricas vinculadas a resultados definidos',
  'A',
  'Resposta correta: Central de serviço',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  'fbe587af-dc66-417d-bb5e-1a5526fe0f60',
  'Qual papel é mais adequado para alguém experiente em TI e relacionamento com stakeholders?',
  'Gerente de nível de serviço',
  'Controle de problemas',
  'Gerenciamento de incidente',
  'Sistema de Valor de Serviço',
  'A',
  'Resposta correta: Gerente de nível de serviço',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '93d577e2-25d2-4111-be6f-c1dca3b9e55f',
  'Qual atividade da cadeia de valor lida com aquisição de novos produtos?',
  'Controle de problemas',
  'Colaborar e promover visibilidade',
  'Desenvolver competências em metodologias e técnicas adequadas às necessidades da organização',
  'Obtenção/Construção',
  'D',
  'Resposta correta: Obtenção/Construção',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  'fa1e6cff-2957-4962-8f96-cd969b51e262',
  'Qual princípio ajuda a garantir melhores informações para tomada de decisão?',
  'Habilidades de comunicação e análise de incidentes',
  'Colaborar e promover visibilidade',
  'Sempre que a solução alternativa for usada',
  'Para ajudar uma organização na tomada de boas decisões',
  'B',
  'Resposta correta: Colaborar e promover visibilidade',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  'af73570f-61a6-4af5-b532-d1a3002992e0',
  'Qual prática observa serviços e reporta mudanças de estado?',
  'Melhoria contínua',
  'Um processo separado',
  'Monitoramento e gerenciamento de evento',
  'Deve ser priorizado conforme ideias são documentadas',
  'C',
  'Resposta correta: Monitoramento e gerenciamento de evento',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '2985c412-917b-4723-9d68-f36f032150aa',
  'O que é uma mudança normalmente implementada como requisição de serviço?',
  'Confirmação de que um produto ou serviço atenderá aos requisitos acordados',
  'Modelo de melhoria contínua',
  'Mudança que precisa ser programada e avaliada seguindo processo',
  'Mudança padrão',
  'D',
  'Resposta correta: Mudança padrão',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '7af37568-1b78-4475-8b36-5cb3b5de187d',
  'Como informações sobre erros conhecidos ajudam no gerenciamento de incidentes?',
  'Cliente',
  'Um resultado pode ser ativado por mais de uma saída',
  'Possibilitam diagnóstico rápido e eficiente',
  'Erros conhecidos',
  'C',
  'Resposta correta: Possibilitam diagnóstico rápido e eficiente',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  'dd24b2f9-9314-43c3-9795-ff798686ebd5',
  'Qual prática gerencia incidentes, consultas e solicitações dos usuários?',
  'Gerenciamento de recursos configurados para entregar o serviço',
  'Gerenciamento de requisição de serviço',
  'Central de serviço',
  'Gerenciamento de incidente',
  'C',
  'Resposta correta: Central de serviço',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  'b79860cc-a1d5-4bdc-b863-9dce633a5dac',
  'Quem define requisitos de serviço e assume responsabilidade pelos resultados?',
  'Utilidade',
  'Atender continuamente às expectativas das partes interessadas em relação aos custos',
  'Cliente',
  'A avaliação e autorização são agilizadas para garantir implementação rápida',
  'C',
  'Resposta correta: Cliente',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '5f4266bc-2237-4341-9bec-12c431922667',
  'Quem participa de um relacionamento de serviço?',
  'Cliente',
  'Central de serviço',
  'Consumidor e provedor',
  'Mudança padrão',
  'C',
  'Resposta correta: Consumidor e provedor',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  'a5e816c1-5a52-4685-89d2-a5cfe7f8450c',
  'O que descreve uma mudança normal?',
  'Colaborar e promover visibilidade',
  'Mudança que precisa ser programada e avaliada seguindo processo',
  'Gerenciamento de recursos configurados para entregar o serviço',
  'Atender continuamente às expectativas das partes interessadas em relação aos custos',
  'B',
  'Resposta correta: Mudança que precisa ser programada e avaliada seguindo processo',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  'e6432e62-93dc-4ef6-8c1d-d80d4f9244bb',
  'O que está relacionado à realização de valor?',
  'Métricas vinculadas a resultados definidos',
  'Alcançar resultados desejados',
  'Sempre que a solução alternativa for usada',
  'Gerenciamento de incidente',
  'B',
  'Resposta correta: Alcançar resultados desejados',
  'standard'
) ON CONFLICT DO NOTHING;

INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
VALUES (
  '975d4fd0-e888-4af8-8185-3deb97ab9f06',
  'Qual afirmativa sobre resultados está correta?',
  'Provedores ajudam consumidores a atingir resultados',
  'Manter o foco no valor em cada etapa da melhoria',
  'Manter de forma simples e prática',
  'Habilitação de mudança',
  'A',
  'Resposta correta: Provedores ajudam consumidores a atingir resultados',
  'standard'
) ON CONFLICT DO NOTHING;

