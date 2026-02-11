
-- Create a helper function to get question counts per topic efficiently
create or replace function get_topic_question_counts()
returns table (topic_id uuid, count bigint)
language sql
security definer
as $$
  select topic_id, count(*) as count
  from public.questions
  where active = true
  group by topic_id;
$$;
