-- Add product_id to exams table
alter table public.exams 
add column if not exists product_id uuid references public.products(id);

-- Add is_demo flag to exams table for easier tracking
alter table public.exams
add column if not exists is_demo boolean default false;

-- RLS
create policy "Exams are viewable by owner" on public.exams for select using (auth.uid() = user_id);
