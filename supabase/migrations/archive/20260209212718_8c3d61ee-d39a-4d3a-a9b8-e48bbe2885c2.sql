
ALTER TABLE public.questions ADD COLUMN question_type text NOT NULL DEFAULT 'standard';
COMMENT ON COLUMN public.questions.question_type IS 'Type: standard, list, missing_word, negative';
