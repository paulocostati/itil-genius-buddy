-- Add display columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS technology text,
ADD COLUMN IF NOT EXISTS level text DEFAULT 'Beginner',
ADD COLUMN IF NOT EXISTS duration_minutes integer DEFAULT 60;

-- Update existing ITIL product (if it exists)
UPDATE public.products 
SET 
  technology = 'IT Service Management', 
  level = 'Foundation', 
  duration_minutes = 60
WHERE slug LIKE '%itil%';
