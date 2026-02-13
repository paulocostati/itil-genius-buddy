-- Allow questions with fewer than 4 options (e.g., Yes/No)
ALTER TABLE public.questions ALTER COLUMN option_c DROP NOT NULL;
ALTER TABLE public.questions ALTER COLUMN option_d DROP NOT NULL;

-- Add translated columns for bilingual exam support
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS statement_pt TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS option_a_pt TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS option_b_pt TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS option_c_pt TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS option_d_pt TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS option_e_pt TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS explanation_pt TEXT;