-- Add is_practice flag to exams table
ALTER TABLE public.exams ADD COLUMN is_practice boolean NOT NULL DEFAULT false;