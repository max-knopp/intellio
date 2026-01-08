import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Lead {
  id: string;
  person_id: string;
  contact_name: string;
  position: string | null;
  company: string | null;
  profile_photo_url: string | null;
  linkedin_url: string;
  post_url: string | null;
  post_content: string | null;
  post_date: string | null;
  ai_message: string;
  ai_comment: string | null;
  relevance_score: number | null;
  status: 'pending' | 'sent' | 'rejected' | 'commented' | 'interested' | 'converted';
  rejection_feedback: string | null;
  final_message: string | null;
  sent_at: string | null;
  created_at: string;
  notes: string | null;
  final_comment: string | null;
}

export function useLeads() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading, error } = useQuery({
    queryKey: ['leads', user?.id],
    queryFn: async () => {
      if (!user) return [];
      // RLS handles access control - fetch all leads the user can see
      // (their own leads + leads from their organization)
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!user,
  });

  const sendLead = useMutation({
    mutationFn: async ({ id, message }: { id: string; message: string }) => {
      const { error } = await supabase
        .from('leads')
        .update({ 
          status: 'sent', 
          final_message: message,
          sent_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'Message sent!', description: 'The lead has been marked as sent.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const rejectLead = useMutation({
    mutationFn: async ({ id, feedback }: { id: string; feedback?: string }) => {
      const { error } = await supabase
        .from('leads')
        .update({ 
          status: 'rejected',
          rejection_feedback: feedback || null
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'Lead rejected', description: 'The lead has been marked as rejected.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const markCommented = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from('leads')
        .update({ status: 'commented' })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'Marked as commented', description: 'The lead has been marked as commented.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateLeadStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Lead['status'] }) => {
      const { error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'Status updated', description: 'The contact status has been updated.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateNotes = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from('leads')
        .update({ notes })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (error) => {
      toast({ title: 'Error saving notes', description: error.message, variant: 'destructive' });
    },
  });

  const updateMessage = useMutation({
    mutationFn: async ({ id, message }: { id: string; message: string }) => {
      const { error } = await supabase
        .from('leads')
        .update({ final_message: message })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (error) => {
      toast({ title: 'Error saving message', description: error.message, variant: 'destructive' });
    },
  });

  const updateComment = useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment: string }) => {
      const { error } = await supabase
        .from('leads')
        .update({ final_comment: comment })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (error) => {
      toast({ title: 'Error saving comment', description: error.message, variant: 'destructive' });
    },
  });

  const pendingLeads = leads.filter(l => l.status === 'pending');
  const commentedLeads = leads.filter(l => l.status === 'commented');
  const sentLeads = leads.filter(l => l.status === 'sent');
  const rejectedLeads = leads.filter(l => l.status === 'rejected');
  const interestedLeads = leads.filter(l => l.status === 'interested');
  const convertedLeads = leads.filter(l => l.status === 'converted');

  return {
    leads,
    pendingLeads,
    commentedLeads,
    sentLeads,
    rejectedLeads,
    interestedLeads,
    convertedLeads,
    isLoading,
    error,
    sendLead,
    rejectLead,
    markCommented,
    updateLeadStatus,
    updateNotes,
    updateMessage,
    updateComment,
  };
}