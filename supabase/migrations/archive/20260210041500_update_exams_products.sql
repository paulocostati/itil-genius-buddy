
-- Update Exams table
alter table public.exams add column if not exists product_id uuid references public.products(id);
alter table public.exams add column if not exists is_demo boolean default false;

-- Update Products table
alter table public.products add column if not exists question_count integer default 40;
