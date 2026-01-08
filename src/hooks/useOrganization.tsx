import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Organization {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
  profile?: {
    name: string;
  };
  email?: string;
}

interface OrganizationContextType {
  organization: Organization | null;
  members: OrgMember[];
  isLoading: boolean;
  userRole: 'owner' | 'admin' | 'member' | null;
  createOrganization: (name: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  refetch: () => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's organization
  const { data: orgMembership, isLoading: loadingMembership, refetch: refetchMembership } = useQuery({
    queryKey: ['org-membership', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('org_members')
        .select('*, organizations(*)')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const organization = orgMembership?.organizations as Organization | null;
  const userRole = orgMembership?.role as 'owner' | 'admin' | 'member' | null;

  // Fetch org members with their profiles
  const { data: members = [], refetch: refetchMembers } = useQuery({
    queryKey: ['org-members', organization?.id],
    queryFn: async () => {
      if (!organization) return [];
      
      // First get org members
      const { data: membersData, error: membersError } = await supabase
        .from('org_members')
        .select('*')
        .eq('org_id', organization.id);
      
      if (membersError) throw membersError;
      
      // Then get profiles for these users
      const userIds = membersData.map(m => m.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', userIds);
      
      if (profilesError) throw profilesError;
      
      // Map profiles to members
      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
      
      return membersData.map(member => ({
        ...member,
        role: member.role as 'owner' | 'admin' | 'member',
        profile: profilesMap.get(member.user_id) || { name: 'Unknown' },
      })) as OrgMember[];
    },
    enabled: !!organization,
  });

  const createOrganization = async (name: string) => {
    if (!user) throw new Error('Not authenticated');

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ name, owner_id: user.id })
      .select()
      .single();

    if (orgError) throw orgError;

    // Add owner as member
    const { error: memberError } = await supabase
      .from('org_members')
      .insert({ org_id: org.id, user_id: user.id, role: 'owner' });

    if (memberError) throw memberError;

    toast({ title: 'Organization created', description: `"${name}" has been created successfully.` });
    refetchMembership();
  };

  const removeMember = async (memberId: string) => {
    const { error } = await supabase
      .from('org_members')
      .delete()
      .eq('id', memberId);

    if (error) throw error;
    toast({ title: 'Member removed' });
    refetchMembers();
  };

  const refetch = () => {
    refetchMembership();
    refetchMembers();
  };

  return (
    <OrganizationContext.Provider value={{
      organization,
      members,
      isLoading: loadingMembership,
      userRole,
      createOrganization,
      removeMember,
      refetch,
    }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
