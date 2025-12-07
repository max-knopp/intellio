import { PodcastLeadCard } from "@/components/PodcastLeadCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Mock data for preview
const mockPodcastLeads = [
  {
    id: "1",
    podcast_name: "The SaaS Growth Show",
    host_name: "Sarah Mitchell",
    episode_title: "Scaling B2B Sales with AI-Powered Outreach",
    episode_url: "https://example.com/episode-1",
    podcast_cover_url: null,
    relevance_score: 92,
    episode_date: "Dec 5, 2024",
    ai_message: "Hi Sarah,\n\nLoved your recent episode on AI-powered outreach! Your insights on balancing automation with personalization really resonated with our approach at Plentimarket.\n\nWe've built a human-in-the-loop sales engine that addresses exactly the challenges you discussed. Would love to share how we're helping sales teams achieve 3x higher response rates.\n\nWould you be open to featuring our story on your show?",
  },
  {
    id: "2",
    podcast_name: "Revenue Architects",
    host_name: "Mike Chen",
    episode_title: "The Future of LinkedIn Prospecting",
    episode_url: "https://example.com/episode-2",
    podcast_cover_url: null,
    relevance_score: 87,
    episode_date: "Dec 3, 2024",
    ai_message: "Hey Mike,\n\nJust finished your LinkedIn prospecting episode - brilliant breakdown of signal-based selling!\n\nWe've been working on something that aligns perfectly with your thesis: using real-time LinkedIn signals to trigger personalized outreach at scale.\n\nThink your audience would find our journey interesting. Happy to discuss?",
  },
  {
    id: "3",
    podcast_name: "Sales Tech Insider",
    host_name: "Jennifer Park",
    episode_title: "Building Trust in Automated Outreach",
    episode_url: "https://example.com/episode-3",
    podcast_cover_url: null,
    relevance_score: 78,
    episode_date: "Nov 28, 2024",
    ai_message: "Hi Jennifer,\n\nYour episode on trust in automation was spot-on. The balance between efficiency and authenticity is something we obsess over.\n\nOur human-in-the-loop approach gives sales managers final say over every message - would love to share how this hybrid model is changing the game.\n\nInterested in having us on?",
  },
  {
    id: "4",
    podcast_name: "B2B Growth Hacks",
    host_name: "David Thompson",
    episode_title: "Cold Outreach That Actually Works",
    episode_url: "https://example.com/episode-4",
    podcast_cover_url: null,
    relevance_score: 65,
    episode_date: "Nov 25, 2024",
    ai_message: "David,\n\nGreat episode on cold outreach strategies! Especially loved your take on signal-based targeting.\n\nWe're helping companies move from spray-and-pray to precision outreach using LinkedIn engagement signals. Would make for an interesting discussion.\n\nOpen to exploring a guest appearance?",
  },
];

export default function Podcasts() {
  const pendingLeads = mockPodcastLeads;
  const sentLeads: typeof mockPodcastLeads = [];
  const skippedLeads: typeof mockPodcastLeads = [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">Podcast Leads</h1>
        <Badge variant="outline" className="text-muted-foreground">
          Preview Mode - Backend not connected
        </Badge>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="pending" className="gap-2">
            Pending
            <Badge variant="secondary" className="ml-1">{pendingLeads.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-2">
            Sent
            <Badge variant="secondary" className="ml-1">{sentLeads.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="skipped" className="gap-2">
            Skipped
            <Badge variant="secondary" className="ml-1">{skippedLeads.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingLeads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No pending podcast leads
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingLeads.map((lead) => (
                <PodcastLeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent">
          <div className="text-center py-12 text-muted-foreground">
            No pitches sent yet
          </div>
        </TabsContent>

        <TabsContent value="skipped">
          <div className="text-center py-12 text-muted-foreground">
            No skipped leads
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
