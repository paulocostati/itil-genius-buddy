
-- Allow admins to insert questions
CREATE POLICY "Admins can insert questions"
ON public.questions FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to read topics (already public, but ensure)
-- Topics already have "Anyone can read topics" policy, so no change needed
