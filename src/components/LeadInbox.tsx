import { useState, useMemo } from 'react';
import { useLeads, Lead } from '@/hooks/useLeads';
import { LeadListItem } from './LeadListItem';
import { LeadDetailPanel } from './LeadDetailPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Inbox, Send, XCircle, Loader2, MessageSquare, ArrowUpDown } from 'lucide-react';
import { getRecencyLevel } from './LeadCard';

type SortOption = 'recency' | 'relevancy';

function sortLeads(leads: Lead[], sortBy: SortOption): Lead[] {
  return [...leads].sort((a, b) => {
    if (sortBy === 'recency') {
      const dateA = new Date(a.post_date || a.created_at).getTime();
      const dateB = new Date(b.post_date || b.created_at).getTime();
      return dateB - dateA;
    } else {
      return (b.relevance_score || 0) - (a.relevance_score || 0);
    }
  });
}

export function LeadInbox() {
  const { pendingLeads, commentedLeads, sentLeads, rejectedLeads, isLoading, sendLead, rejectLead, markCommented } = useLeads();
  const [sortBy, setSortBy] = useState<SortOption>('recency');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const sortedPendingLeads = useMemo(() => sortLeads(pendingLeads, sortBy), [pendingLeads, sortBy]);
  const sortedCommentedLeads = useMemo(() => sortLeads(commentedLeads, sortBy), [commentedLeads, sortBy]);
  const sortedSentLeads = useMemo(() => sortLeads(sentLeads, sortBy), [sentLeads, sortBy]);
  const sortedRejectedLeads = useMemo(() => sortLeads(rejectedLeads, sortBy), [rejectedLeads, sortBy]);

  const allLeads = useMemo(() => 
    [...pendingLeads, ...commentedLeads, ...sentLeads, ...rejectedLeads],
    [pendingLeads, commentedLeads, sentLeads, rejectedLeads]
  );

  const selectedLead = useMemo(() => 
    allLeads.find(l => l.id === selectedLeadId) || null,
    [allLeads, selectedLeadId]
  );

  const handleSend = (id: string, message: string) => {
    sendLead.mutate({ id, message });
  };

  const handleReject = (id: string, feedback?: string) => {
    rejectLead.mutate({ id, feedback });
  };

  const handleMarkCommented = (id: string) => {
    markCommented.mutate({ id });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderLeadList = (leads: Lead[]) => {
    if (leads.length === 0) return null;
    return leads.map((lead) => (
      <LeadListItem
        key={lead.id}
        lead={lead}
        isSelected={selectedLeadId === lead.id}
        onClick={() => setSelectedLeadId(lead.id)}
      />
    ));
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-background rounded-lg border border-border overflow-hidden">
      {/* Left Panel - List */}
      <div className="w-full md:w-96 lg:w-[420px] flex flex-col border-r border-border flex-shrink-0">
        <Tabs defaultValue="pending" className="flex flex-col h-full">
          {/* Header */}
          <div className="p-3 border-b border-border space-y-3">
            <TabsList className="w-full grid grid-cols-4 bg-muted/50">
              <TabsTrigger value="pending" className="text-xs gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Inbox className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pending</span>
                {pendingLeads.length > 0 && (
                  <Badge variant="secondary" className="ml-0.5 h-5 min-w-5 px-1 text-xs">
                    {pendingLeads.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="commented" className="text-xs gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Commented</span>
                {commentedLeads.length > 0 && (
                  <Badge variant="secondary" className="ml-0.5 h-5 min-w-5 px-1 text-xs">
                    {commentedLeads.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent" className="text-xs gap-1">
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sent</span>
                {sentLeads.length > 0 && (
                  <Badge variant="secondary" className="ml-0.5 h-5 min-w-5 px-1 text-xs">
                    {sentLeads.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="rejected" className="text-xs gap-1">
                <XCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Rejected</span>
                {rejectedLeads.length > 0 && (
                  <Badge variant="secondary" className="ml-0.5 h-5 min-w-5 px-1 text-xs">
                    {rejectedLeads.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="h-8 text-xs bg-background">
                <ArrowUpDown className="w-3.5 h-3.5 mr-1.5" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="recency">Sort by Recency</SelectItem>
                <SelectItem value="relevancy">Sort by Relevancy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lead Lists */}
          <div className="flex-1 overflow-hidden">
            <TabsContent value="pending" className="h-full m-0">
              <ScrollArea className="h-full">
                {sortedPendingLeads.length === 0 ? (
                  <EmptyState icon={<Inbox className="w-10 h-10" />} title="No pending leads" />
                ) : (
                  renderLeadList(sortedPendingLeads)
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="commented" className="h-full m-0">
              <ScrollArea className="h-full">
                {sortedCommentedLeads.length === 0 ? (
                  <EmptyState icon={<MessageSquare className="w-10 h-10" />} title="No commented leads" />
                ) : (
                  renderLeadList(sortedCommentedLeads)
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="sent" className="h-full m-0">
              <ScrollArea className="h-full">
                {sortedSentLeads.length === 0 ? (
                  <EmptyState icon={<Send className="w-10 h-10" />} title="No sent messages" />
                ) : (
                  renderLeadList(sortedSentLeads)
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="rejected" className="h-full m-0">
              <ScrollArea className="h-full">
                {sortedRejectedLeads.length === 0 ? (
                  <EmptyState icon={<XCircle className="w-10 h-10" />} title="No rejected leads" />
                ) : (
                  renderLeadList(sortedRejectedLeads)
                )}
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Right Panel - Detail */}
      <div className="hidden md:flex flex-1 bg-muted/30">
        {selectedLead ? (
          <LeadDetailPanel
            lead={selectedLead}
            onSend={handleSend}
            onReject={handleReject}
            onMarkCommented={handleMarkCommented}
            isLoading={sendLead.isPending || rejectLead.isPending || markCommented.isPending}
            onClose={() => setSelectedLeadId(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Select a lead to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/50">
      {icon}
      <p className="mt-2 text-sm">{title}</p>
    </div>
  );
}