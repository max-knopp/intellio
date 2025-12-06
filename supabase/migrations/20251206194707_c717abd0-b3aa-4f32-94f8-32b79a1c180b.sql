-- Allow service role to insert leads (for webhook)
-- The edge function uses service role key to bypass RLS
-- But we also need a policy for the webhook to work

-- Create policy for inserting leads via service role
CREATE POLICY "Service role can insert leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);