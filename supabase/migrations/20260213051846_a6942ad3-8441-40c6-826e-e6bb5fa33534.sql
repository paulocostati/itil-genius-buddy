
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can read questions" ON public.questions;

-- Create restricted policy: users can only read questions that are part of their exams
CREATE POLICY "Users can read questions in their exams" 
ON public.questions FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR EXISTS (
    SELECT 1 FROM public.exam_questions eq 
    JOIN public.exams e ON e.id = eq.exam_id 
    WHERE eq.question_id = questions.id 
    AND e.user_id = auth.uid()
  )
);

-- Create a public RPC for question counts (so catalog/product pages can show counts without reading questions)
CREATE OR REPLACE FUNCTION public.count_questions_by_topics(topic_ids uuid[])
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::bigint FROM public.questions WHERE topic_id = ANY(topic_ids)
$$;
