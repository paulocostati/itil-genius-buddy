
-- Remove public read policy on questions
DROP POLICY IF EXISTS "Anyone can read questions" ON public.questions;

-- Only authenticated users can read questions
CREATE POLICY "Authenticated users can read questions"
ON public.questions
FOR SELECT
TO authenticated
USING (true);
