import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Flame, Thermometer, Snowflake, Sparkles } from 'lucide-react';
import { Lead } from '@/hooks/useLeads';
import { getRecencyLevel } from './LeadCard';
import { cn } from '@/lib/utils';

interface LeadListItemProps {
  lead: Lead;
  isSelected: boolean;
  onClick: () => void;
}

export function LeadListItem({ lead, isSelected, onClick }: LeadListItemProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-muted-foreground';
  };

  const recency = getRecencyLevel(lead.post_date || lead.created_at);

  const RecencyIcon = recency === 'hot' ? Flame : recency === 'warm' ? Thermometer : Snowflake;
  const recencyColor = recency === 'hot' 
    ? 'text-orange-500' 
    : recency === 'warm' 
      ? 'text-amber-500' 
      : 'text-blue-500';

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-border transition-colors",
        isSelected 
          ? "bg-primary/10 border-l-2 border-l-primary" 
          : "hover:bg-muted/50"
      )}
    >
      <Avatar className="h-9 w-9 border border-border flex-shrink-0">
        <AvatarImage src={lead.profile_photo_url || undefined} alt={lead.contact_name} />
        <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
          {getInitials(lead.contact_name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-foreground truncate">
            {lead.contact_name}
          </span>
          <span className="text-xs text-muted-foreground truncate hidden sm:inline">
            {lead.position && `• ${lead.position}`}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {lead.post_content || 'No post content'}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <RecencyIcon className={cn("w-3.5 h-3.5", recencyColor)} />
        
        {lead.relevance_score && (
          <div className={cn("flex items-center gap-0.5 text-xs font-medium", getScoreColor(lead.relevance_score))}>
            <Sparkles className="w-3 h-3" />
            {lead.relevance_score}%
          </div>
        )}
      </div>
    </div>
  );
}