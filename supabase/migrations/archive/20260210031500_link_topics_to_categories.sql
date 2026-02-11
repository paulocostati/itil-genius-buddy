-- Add category_id to topics
alter table public.topics 
add column if not exists category_id uuid references public.categories(id);

-- Link existing topics to ITIL category
-- We assume 'itil' category exists from previous migration
do $$
begin
  if exists (select 1 from public.categories where slug = 'itil') then
    update public.topics 
    set category_id = (select id from public.categories where slug = 'itil')
    where category_id is null;
  end if;
end $$;

-- RLS for topics
alter table public.topics enable row level security;
create policy "Topics are viewable by everyone" on public.topics for select using (true);

-- Ensure questions are viewable
alter table public.questions enable row level security;
create policy "Questions are viewable by everyone" on public.questions for select using (true);
