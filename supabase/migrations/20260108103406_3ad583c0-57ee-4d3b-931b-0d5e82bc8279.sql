-- Drop existing permissive policies
DROP POLICY IF EXISTS "Org members can view leads" ON public.leads;
DROP POLICY IF EXISTS "Org members can update leads" ON public.leads;
DROP POLICY IF EXISTS "Org members can delete leads" ON public.leads;

-- Create restrictive policies - only lead owner can access
CREATE POLICY "Users can view their own leads"
ON public.leads
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads"
ON public.leads
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads"
ON public.leads
FOR DELETE
USING (auth.uid() = user_id);