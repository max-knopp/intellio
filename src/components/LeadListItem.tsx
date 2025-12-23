import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Flame, Thermometer, Snowflake } from 'lucide-react';
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

  const recency = getRecencyLevel(lead.post_date || lead.created_at);

  const getRecencyBadge = () => {
    if (recency === 'hot') {
      return (
        <Badge variant="outline" className="h-5 text-[10px] px-1.5 gap-0.5 border-orange-500/50 bg-orange-500/10 text-orange-600">
          <Flame className="w-2.5 h-2.5" />
          Hot
        </Badge>
      );
    }
    if (recency === 'warm') {
      return (
        <Badge variant="outline" className="h-5 text-[10px] px-1.5 gap-0.5 border-amber-500/50 bg-amber-500/10 text-amber-600">
          <Thermometer className="w-2.5 h-2.5" />
          Warm
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="h-5 text-[10px] px-1.5 gap-0.5 border-blue-500/50 bg-blue-500/10 text-blue-600">
        <Snowflake className="w-2.5 h-2.5" />
        Cold
      </Badge>
    );
  };

  const getRelevancyBadge = () => {
    const score = lead.relevance_score;
    if (!score) return null;
    
    if (score >= 80) {
      return (
        <Badge variant="outline" className="h-5 text-[10px] px-1.5 border-emerald-500/50 bg-emerald-500/10 text-emerald-600">
          {score}%
        </Badge>
      );
    }
    if (score >= 60) {
      return (
        <Badge variant="outline" className="h-5 text-[10px] px-1.5 border-yellow-500/50 bg-yellow-500/10 text-yellow-600">
          {score}%
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="h-5 text-[10px] px-1.5 border-muted-foreground/50 bg-muted/50 text-muted-foreground">
        {score}%
      </Badge>
    );
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-3 px-3 py-2.5 cursor-pointer border-b border-border transition-colors",
        isSelected 
          ? "bg-primary/10 border-l-2 border-l-primary" 
          : "hover:bg-muted/50"
      )}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 border border-border flex-shrink-0">
        <AvatarImage src={lead.profile_photo_url || undefined} alt={lead.contact_name} />
        <AvatarFallback className="bg-primary/10 text-primary font-medium text-[10px]">
          {getInitials(lead.contact_name)}
        </AvatarFallback>
      </Avatar>

      {/* Name, Company & Title */}
      <div className="min-w-0 space-y-0.5">
        <div className="flex items-center gap-1.5">
          {lead.company && (
            <span className="text-[11px] font-semibold text-primary truncate max-w-[100px]">
              {lead.company}
            </span>
          )}
          <span className="text-[11px] font-medium text-foreground truncate">
            {lead.contact_name}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground truncate">
          {lead.position || lead.post_content || 'No details'}
        </p>
      </div>

      {/* Post Preview */}
      <p className="text-[10px] text-muted-foreground truncate max-w-[150px] hidden lg:block">
        {lead.post_content?.slice(0, 60) || '—'}
      </p>

      {/* Recency Badge */}
      <div className="flex-shrink-0">
        {getRecencyBadge()}
      </div>

      {/* Relevancy Badge */}
      <div className="flex-shrink-0 w-12 text-right">
        {getRelevancyBadge()}
      </div>
    </div>
  );
}