
-- Add option_e for questions with 5+ options (e.g., AZ-900)
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS option_e text;
