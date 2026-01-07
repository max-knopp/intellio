-- Create a table to track daily summary sends for idempotency
CREATE TABLE public.daily_summary_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  summary_date DATE NOT NULL UNIQUE,
  hot_leads INTEGER NOT NULL,
  warm_leads INTEGER NOT NULL,
  total_actionable INTEGER NOT NULL,
  webhook_status INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_summary_log ENABLE ROW LEVEL SECURITY;

-- Only service role can insert/read (used by edge function)
CREATE POLICY "Service role only" 
ON public.daily_summary_log 
FOR ALL 
USING (false)
WITH CHECK (false);