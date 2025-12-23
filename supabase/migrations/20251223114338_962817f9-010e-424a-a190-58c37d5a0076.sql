-- Update the status check constraint to include 'interested' and 'converted'
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE public.leads ADD CONSTRAINT leads_status_check 
  CHECK (status IN ('pending', 'sent', 'rejected', 'commented', 'interested', 'converted'));