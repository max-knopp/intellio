-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create org_members table for membership
CREATE TABLE public.org_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (org_id, user_id)
);

-- Create org_invites table for pending invitations
CREATE TABLE public.org_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  UNIQUE (org_id, email)
);

-- Add org_id to leads table
ALTER TABLE public.leads ADD COLUMN org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Enable RLS on new tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_invites ENABLE ROW LEVEL SECURITY;

-- Security definer function to check org membership
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members
    WHERE user_id = _user_id AND org_id = _org_id
  )
$$;

-- Security definer function to get user's org_id
CREATE OR REPLACE FUNCTION public.get_user_org_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id FROM public.org_members WHERE user_id = _user_id LIMIT 1
$$;

-- RLS for organizations: members can view their org
CREATE POLICY "Members can view their organization"
ON public.organizations FOR SELECT
USING (public.is_org_member(auth.uid(), id));

CREATE POLICY "Owners can update their organization"
ON public.organizations FOR UPDATE
USING (owner_id = auth.uid());

CREATE POLICY "Users can create organizations"
ON public.organizations FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- RLS for org_members
CREATE POLICY "Members can view org members"
ON public.org_members FOR SELECT
USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Org owners/admins can add members"
ON public.org_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.org_members
    WHERE org_id = org_members.org_id
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
  OR (user_id = auth.uid() AND role = 'owner')
);

CREATE POLICY "Org owners can remove members"
ON public.org_members FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.organizations
    WHERE id = org_id AND owner_id = auth.uid()
  )
  OR user_id = auth.uid()
);

-- RLS for org_invites
CREATE POLICY "Members can view org invites"
ON public.org_invites FOR SELECT
USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Admins can create invites"
ON public.org_invites FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.org_members
    WHERE org_id = org_invites.org_id
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Admins can delete invites"
ON public.org_invites FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.org_members
    WHERE org_id = org_invites.org_id
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);

-- Update leads RLS to allow org members full access
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;

CREATE POLICY "Org members can view leads"
ON public.leads FOR SELECT
USING (
  auth.uid() = user_id 
  OR (org_id IS NOT NULL AND public.is_org_member(auth.uid(), org_id))
);

CREATE POLICY "Org members can update leads"
ON public.leads FOR UPDATE
USING (
  auth.uid() = user_id 
  OR (org_id IS NOT NULL AND public.is_org_member(auth.uid(), org_id))
);

CREATE POLICY "Org members can delete leads"
ON public.leads FOR DELETE
USING (
  auth.uid() = user_id 
  OR (org_id IS NOT NULL AND public.is_org_member(auth.uid(), org_id))
);

-- Add triggers for updated_at
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();