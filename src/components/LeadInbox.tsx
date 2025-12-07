import { useLeads } from '@/hooks/useLeads';
import { LeadCard } from './LeadCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Inbox, Send, XCircle, Loader2, MessageSquare } from 'lucide-react';

export function LeadInbox() {
  const { pendingLeads, commentedLeads, sentLeads, rejectedLeads, isLoading, sendLead, rejectLead, markCommented } = useLeads();

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

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="mb-6 bg-card border border-border">
        <TabsTrigger value="pending" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground group">
          <Inbox className="w-4 h-4" />
          Pending
          {pendingLeads.length > 0 && (
            <Badge variant="secondary" className="ml-1 bg-primary/20 text-primary group-data-[state=active]:bg-primary-foreground/20 group-data-[state=active]:text-primary-foreground">
              {pendingLeads.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="commented" className="gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
          <MessageSquare className="w-4 h-4" />
          Commented
          {commentedLeads.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {commentedLeads.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="sent" className="gap-2 data-[state=active]:bg-success data-[state=active]:text-success-foreground">
          <Send className="w-4 h-4" />
          Sent
          {sentLeads.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {sentLeads.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="rejected" className="gap-2 data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
          <XCircle className="w-4 h-4" />
          Rejected
          {rejectedLeads.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {rejectedLeads.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending">
        {pendingLeads.length === 0 ? (
          <EmptyState
            icon={<Inbox className="w-12 h-12 text-muted-foreground/50" />}
            title="No pending leads"
            description="New leads from Cargo will appear here for your review."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onSend={handleSend}
                onReject={handleReject}
                onMarkCommented={handleMarkCommented}
                isLoading={sendLead.isPending || rejectLead.isPending || markCommented.isPending}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="commented">
        {commentedLeads.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="w-12 h-12 text-muted-foreground/50" />}
            title="No commented leads"
            description="Leads you've commented on will appear here."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {commentedLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onSend={handleSend}
                onReject={handleReject}
                onMarkCommented={handleMarkCommented}
                isLoading={false}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="sent">
        {sentLeads.length === 0 ? (
          <EmptyState
            icon={<Send className="w-12 h-12 text-muted-foreground/50" />}
            title="No sent messages yet"
            description="Approved outreach messages will appear here."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sentLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onSend={handleSend}
                onReject={handleReject}
                onMarkCommented={handleMarkCommented}
                isLoading={false}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="rejected">
        {rejectedLeads.length === 0 ? (
          <EmptyState
            icon={<XCircle className="w-12 h-12 text-muted-foreground/50" />}
            title="No rejected leads"
            description="Rejected leads will be stored here for reference."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rejectedLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onSend={handleSend}
                onReject={handleReject}
                onMarkCommented={handleMarkCommented}
                isLoading={false}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon}
      <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
  );
}