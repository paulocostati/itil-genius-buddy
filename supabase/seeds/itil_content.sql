-- Create ITIL 4 Foundation Product
INSERT INTO public.products (id, title, slug, short_description, full_description, price_cents, active, question_count, demo_enabled, category_id, technology, level, duration_minutes)
VALUES (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
    'Exame Simulado ITIL 4 Foundation',
    'itil-4-foundation-exam',
    'Prepare-se para a certificação ITIL 4 Foundation com nosso simulado completo.',
    'Este simulado cobre todos os tópicos do exame ITIL 4 Foundation, incluindo os Princípios Orientadores, as 4 Dimensões, o SVS e as Práticas de Gerenciamento. Inclui questões no padrão do exame real.',
    4990,
    true,
    40,
    true,
    (SELECT id FROM public.categories WHERE slug = 'itil-4-foundation' LIMIT 1),
    'IT Service Management',
    'Foundation',
    60
) ON CONFLICT (id) DO UPDATE SET 
    active = true, 
    demo_enabled = true,
    technology = EXCLUDED.technology,
    level = EXCLUDED.level,
    duration_minutes = EXCLUDED.duration_minutes;

-- ... (Rest of the file remains the same: Insert Topics, Questions)
-- Using a temporary variable to store category id
DO $$
DECLARE
    cat_id uuid;
    topic_1 uuid := '11111111-1111-1111-1111-111111111111';
    topic_2 uuid := '22222222-2222-2222-2222-222222222222';
    topic_3 uuid := '33333333-3333-3333-3333-333333333333';
    topic_4 uuid := '44444444-4444-4444-4444-444444444444';
BEGIN
    SELECT id INTO cat_id FROM public.categories WHERE slug = 'itil-4-foundation' LIMIT 1;
    
    INSERT INTO public.topics (id, name, area, weight, category_id) VALUES 
    (topic_1, 'Conceitos-chave de gerenciamento de serviço', '1. Conceitos-chave', 5, cat_id),
    (topic_2, 'Os princípios orientadores', '2. Princípios Orientadores', 6, cat_id),
    (topic_3, 'As quatro dimensões do gerenciamento', '3. Quatro Dimensões', 2, cat_id),
    (topic_4, 'As práticas de gerenciamento da ITIL', '7. Entender 7 Práticas ITIL', 17, cat_id)
    ON CONFLICT (id) DO NOTHING;

    -- Insert Questions
    INSERT INTO public.questions (topic_id, statement, option_a, option_b, option_c, option_d, correct_option, explanation, question_type)
    VALUES
    -- Topic 1: Key Concepts
    (topic_1, 'Qual é a definição de "Serviço"?', 
     'Um meio de permitir a cocriação de valor, facilitando os resultados que os clientes desejam alcançar, sem que o cliente tenha que gerenciar custos e riscos específicos.', 
     'Um conjunto de recursos organizacionais especializados para gerar valor para os interessados.', 
     'A funcionalidade de um produto ou serviço para atender a uma necessidade específica.', 
     'Uma configuração de recursos de uma organização, projetada para oferecer valor a um consumidor.', 
     'A', 
     'A definição oficial de Serviço na ITIL 4 é: "Um meio de permitir a cocriação de valor..."', 'standard'),
    
    (topic_1, 'O que é "Utilidade"?',
     'A garantia de que um produto ou serviço atenderá aos requisitos acordados.',
     'A funcionalidade de um produto ou serviço para atender a uma necessidade específica.',
     'A quantidade de dinheiro gasta em uma atividade ou recurso específico.',
     'Um possível evento futuro que pode causar danos ou perdas.',
     'B',
     'Utilidade é a funcionalidade oferecida por um produto ou serviço para atender a uma necessidade específica. Costuma ser resumida como "o que o serviço faz".', 'standard'),

    (topic_1, 'Qual termo descreve "uma pessoa ou grupo de pessoas que tem suas próprias funções com responsabilidades, autoridades e relacionamentos para atingir seus objetivos"?',
     'Consumidor de serviço',
     'Provedor de serviço',
     'Organização',
     'Cliente',
     'C',
     'Uma organização é definida como uma pessoa ou grupo com suas próprias funções...', 'standard'),
     
    -- Topic 2: Guiding Principles
    (topic_2, 'Qual princípio orientador recomenda o uso da quantidade mínima de passos necessários para atingir um objetivo?',
     'Foco no valor',
     'Mantenha de forma simples e prática',
     'Progrida iterativamente com feedback',
     'Pense e trabalhe holisticamente',
     'B',
     'O princípio "Mantenha de forma simples e prática" (Keep it simple and practical) recomenda eliminar processos, serviços ou ações que não geram valor.', 'standard'),

    (topic_2, 'Qual princípio orientador enfatiza a necessidade de entender a experiência do usuário?',
     'Foco no valor',
     'Comece onde você está',
     'Colaborar e promover visibilidade',
     'Otimizar e automatizar',
     'A',
     'O princípio "Foco no valor" exige o entendimento de quem é o consumidor e como o serviço gera valor para ele (CX/UX).', 'standard'),

    (topic_2, 'Ao adotar uma nova ferramenta, uma organização deve primeiro avaliar o que já existe. Qual princípio descreve isso?',
     'Progrida iterativamente com feedback',
     'Mantenha de forma simples e prática',
     'Comece onde você está',
     'Pense e trabalhe holisticamente',
     'C',
     '"Comece onde você está" recomenda avaliar o estado atual e reutilizar o que for útil antes de criar algo novo.', 'standard'),

    -- Topic 3: Four Dimensions
    (topic_3, 'Quais são as quatro dimensões do gerenciamento de serviço?',
     'Organizações e Pessoas; Informação e Tecnologia; Parceiros e Fornecedores; Fluxos de Valor e Processos',
     'Pessoas; Produtos; Parceiros; Processos',
     'Político; Econômico; Social; Tecnológico',
     'Planejar; Fazer; Verificar; Agir',
     'A',
     'As 4 dimensões são: Organizações e Pessoas, Informação e Tecnologia, Parceiros e Fornecedores, Fluxos de Valor e Processos.', 'standard'),

    (topic_3, 'Qual dimensão abrange os papéis e responsabilidades, sistemas de autoridade e comunicação?',
     'Fluxos de Valor e Processos',
     'Parceiros e Fornecedores',
     'Informação e Tecnologia',
     'Organizações e Pessoas',
     'D',
     'A dimensão "Organizações e Pessoas" trata da estrutura organizacional, cultura, papéis e habilidades.', 'standard'),

    -- Topic 4: Practices
    (topic_4, 'Qual prática tem o objetivo de minimizar o impacto negativo de incidentes restaurando a operação normal do serviço o mais rápido possível?',
     'Gerenciamento de problemas',
     'Gerenciamento de incidentes',
     'Gerenciamento de requisição de serviço',
     'Central de serviço (Service Desk)',
     'B',
     'O Gerenciamento de Incidentes foca na restauração rápida do serviço.', 'standard'),

    (topic_4, 'Qual prática é responsável por mover componentes novos ou alterados para ambientes de produção?',
     'Gerenciamento de liberação',
     'Gerenciamento de implantação',
     'Controle de mudança',
     'Gerenciamento de configuração de serviço',
     'B',
     'O Gerenciamento de Implantação (Deployment Management) move o hardware, software ou outros componentes para o ambiente de produção.', 'standard'),
     
    (topic_4, 'O que é uma "Mudança"?',
     'A adição, modificação ou remoção de qualquer item que possa ter um efeito direto ou indireto em serviços.',
     'Uma interrupção não planejada de um serviço ou redução na qualidade de um serviço.',
     'Uma solicitação de um usuário para informações ou acesso a um serviço.',
     'A causa raiz de um ou mais incidentes.',
     'A',
     'Definição padrão de Mudança na ITIL.', 'standard'),
     
    (topic_4, 'Qual prática fornece um ponto único de contato para os usuários?',
     'Gerenciamento de relacionamento',
     'Gerenciamento de incidentes',
     'Central de Serviço (Service Desk)',
     'Gerenciamento de níveis de serviço',
     'C',
     'A Central de Serviço (Service Desk) é o ponto de contato único para os usuários relatarem problemas e fazerem solicitações.', 'standard')
    ON CONFLICT DO NOTHING;

END $$;
