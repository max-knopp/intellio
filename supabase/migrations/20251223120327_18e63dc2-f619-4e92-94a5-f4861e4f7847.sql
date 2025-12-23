-- Create table for Cargo API logs
CREATE TABLE public.cargo_api_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  request_payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cargo_api_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own logs
CREATE POLICY "Users can view their own cargo logs"
ON public.cargo_api_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Service role can insert logs (from edge function)
CREATE POLICY "Service role can insert cargo logs"
ON public.cargo_api_logs
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_cargo_api_logs_lead_id ON public.cargo_api_logs(lead_id);
CREATE INDEX idx_cargo_api_logs_user_id ON public.cargo_api_logs(user_id);
CREATE INDEX idx_cargo_api_logs_created_at ON public.cargo_api_logs(created_at DESC);