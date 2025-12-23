-- Drop the existing permissive SELECT policy
DROP POLICY IF EXISTS "Members can view org invites" ON public.org_invites;

-- Create a new restricted SELECT policy for admins and owners only
CREATE POLICY "Admins and owners can view org invites" 
ON public.org_invites 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.org_members
    WHERE org_members.org_id = org_invites.org_id 
    AND org_members.user_id = auth.uid() 
    AND org_members.role IN ('owner', 'admin')
  )
);