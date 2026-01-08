-- Add final_comment column to store edited comments
ALTER TABLE public.leads
ADD COLUMN final_comment text;