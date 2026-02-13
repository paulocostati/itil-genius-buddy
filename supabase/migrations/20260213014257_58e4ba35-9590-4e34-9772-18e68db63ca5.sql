
-- Allow admins to insert topics (needed for managing topics per category)
CREATE POLICY "Admins can insert topics" ON public.topics FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

-- Allow admins to update topics (e.g. change category_id)
CREATE POLICY "Admins can update topics" ON public.topics FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Allow admins to delete topics
CREATE POLICY "Admins can delete topics" ON public.topics FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Allow admins to update questions
CREATE POLICY "Admins can update questions" ON public.questions FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Allow admins to delete questions
CREATE POLICY "Admins can delete questions" ON public.questions FOR DELETE USING (has_role(auth.uid(), 'admin'));
