-- Update the CHECK constraint on leads table to include 'commented' status
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE leads ADD CONSTRAINT leads_status_check CHECK (status IN ('pending', 'sent', 'rejected', 'commented'));