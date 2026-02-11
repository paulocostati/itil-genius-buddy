
-- Update product question count to reflect imported data
UPDATE public.products 
SET question_count = 157 
WHERE slug = 'itil-4-foundation-exam';
