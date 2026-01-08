-- Drop the restrictive policies
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;

-- Restore org-based access policies
CREATE POLICY "Users and org members can view leads"
ON public.leads
FOR SELECT
USING (
  auth.uid() = user_id 
  OR (org_id IS NOT NULL AND is_org_member(auth.uid(), org_id))
);

CREATE POLICY "Users and org members can update leads"
ON public.leads
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR (org_id IS NOT NULL AND is_org_member(auth.uid(), org_id))
);

CREATE POLICY "Users and org members can delete leads"
ON public.leads
FOR DELETE
USING (
  auth.uid() = user_id 
  OR (org_id IS NOT NULL AND is_org_member(auth.uid(), org_id))
);