-- Add notes column to leads table for user feedback
ALTER TABLE public.leads 
ADD COLUMN notes text;