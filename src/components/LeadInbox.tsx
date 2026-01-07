import { useState, useMemo } from 'react';
import { useLeads, Lead } from '@/hooks/useLeads';
import { LeadListItem } from './LeadListItem';
import { LeadDetailPanel } from './LeadDetailPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Inbox, Send, XCircle, Loader2, MessageSquare, ArrowUpDown } from 'lucide-react';
import { getRecencyLevel } from './LeadCard';

type SortOption = 'recency-then-score' | 'score-then-recency';

function sortLeads(leads: Lead[], sortBy: SortOption): Lead[] {
  return [...leads].sort((a, b) => {
    const recencyA = getRecencyLevel(a.post_date || a.created_at);
    const recencyB = getRecencyLevel(b.post_date || b.created_at);
    const recencyOrder = { 'Hot': 0, 'Warm': 1, 'Cold': 2 };
    const scoreA = a.relevance_score || 0;
    const scoreB = b.relevance_score || 0;

    if (sortBy === 'recency-then-score') {
      // Primary: recency category (Hot > Warm > Cold)
      if (recencyOrder[recencyA] !== recencyOrder[recencyB]) {
        return recencyOrder[recencyA] - recencyOrder[recencyB];
      }
      // Secondary: score within same recency category
      return scoreB - scoreA;
    } else {
      // Primary: score
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      // Secondary: recency within same score
      return recencyOrder[recencyA] - recencyOrder[recencyB];
    }
  });
}

export function LeadInbox() {
  const { pendingLeads, commentedLeads, sentLeads, rejectedLeads, isLoading, sendLead, rejectLead, markCommented } = useLeads();
  const [sortBy, setSortBy] = useState<SortOption>('recency-then-score');
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
    <div className="h-[calc(100vh-8rem)] bg-background rounded-lg border border-border overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        {/* Left Panel - List */}
        <ResizablePanel defaultSize={66} minSize={40} maxSize={80}>
          <div className="flex flex-col h-full">
            <Tabs defaultValue="pending" className="flex flex-col h-full">
              {/* Header */}
              <div className="p-2 border-b border-border space-y-2">
                <TabsList className="w-full h-8 p-0.5 bg-muted/50 grid grid-cols-4">
                  <TabsTrigger 
                    value="pending" 
                    className="h-7 text-[11px] gap-1 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Inbox className="w-3 h-3" />
                    <span>Pending</span>
                    {pendingLeads.length > 0 && (
                      <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[10px] ml-0.5">
                        {pendingLeads.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="commented" 
                    className="h-7 text-[11px] gap-1 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Commented</span>
                    {commentedLeads.length > 0 && (
                      <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[10px] ml-0.5">
                        {commentedLeads.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="sent" 
                    className="h-7 text-[11px] gap-1 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Send className="w-3 h-3" />
                    <span>Sent</span>
                    {sentLeads.length > 0 && (
                      <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[10px] ml-0.5">
                        {sentLeads.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="rejected" 
                    className="h-7 text-[11px] gap-1 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <XCircle className="w-3 h-3" />
                    <span>Rejected</span>
                    {rejectedLeads.length > 0 && (
                      <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[10px] ml-0.5">
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
                    <SelectItem value="recency-then-score">Recency → Score</SelectItem>
                    <SelectItem value="score-then-recency">Score → Recency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Column Headers */}
              <div className="grid grid-cols-[32px_100px_120px_80px_1fr_60px_50px] items-center gap-2 px-3 py-1.5 border-b border-border bg-muted/30 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                <span></span>
                <span>Company</span>
                <span>Name</span>
                <span>Title</span>
                <span>Post</span>
                <span className="text-center">Recency</span>
                <span className="text-right">Score</span>
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
        </ResizablePanel>

        <ResizableHandle withHandle className="hidden md:flex" />

        {/* Right Panel - Detail */}
        <ResizablePanel defaultSize={34} minSize={20} className="hidden md:block">
          <div className="h-full bg-muted/30">
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
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Select a lead to view details</p>
                </div>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
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