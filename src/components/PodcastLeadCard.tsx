import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink, Send, X, Mic, Copy, Check, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PodcastLead {
  id: string;
  podcast_name: string;
  host_name: string;
  episode_title: string;
  episode_url: string;
  podcast_cover_url: string | null;
  relevance_score: number;
  episode_date: string;
  ai_message: string;
}

interface PodcastLeadCardProps {
  lead: PodcastLead;
}

export function PodcastLeadCard({ lead }: PodcastLeadCardProps) {
  const [message, setMessage] = useState(lead.ai_message);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-success text-success-foreground";
    if (score >= 60) return "bg-warning text-warning-foreground";
    return "bg-muted text-muted-foreground";
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-3 h-14">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 rounded-lg">
            <AvatarImage src={lead.podcast_cover_url || undefined} alt={lead.podcast_name} />
            <AvatarFallback className="rounded-lg bg-primary/10">
              <Mic className="h-5 w-5 text-primary" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-foreground truncate">{lead.podcast_name}</h3>
              <Badge className={`text-xs ${getScoreColor(lead.relevance_score)}`}>
                {lead.relevance_score}%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              Hosted by {lead.host_name}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Episode Info */}
        <div className="space-y-2">
          <p className="text-sm font-medium line-clamp-2 h-10">{lead.episode_title}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground h-6">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {lead.episode_date}
            </span>
            <a
              href={lead.episode_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Listen to episode
            </a>
          </div>
        </div>

        {/* AI Message */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              AI-Generated Pitch
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-6 px-2"
            >
              {copied ? (
                <Check className="h-3 w-3 text-success" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[80px] text-sm bg-secondary/50 resize-none h-32"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button className="flex-1 gap-2" size="sm">
            <Send className="h-4 w-4" />
            Send Pitch
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <X className="h-4 w-4" />
            Skip
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
