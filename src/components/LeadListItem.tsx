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
        "grid grid-cols-[32px_100px_120px_80px_1fr_60px_50px] items-center gap-2 px-3 py-2 cursor-pointer border-b border-border transition-colors text-[11px]",
        isSelected 
          ? "bg-primary/10 border-l-2 border-l-primary" 
          : "hover:bg-muted/50"
      )}
    >
      {/* Avatar */}
      <Avatar className="h-7 w-7 border border-border flex-shrink-0">
        <AvatarImage src={lead.profile_photo_url || undefined} alt={lead.contact_name} />
        <AvatarFallback className="bg-primary/10 text-primary font-medium text-[9px]">
          {getInitials(lead.contact_name)}
        </AvatarFallback>
      </Avatar>

      {/* Company */}
      <span className="font-semibold text-primary truncate">
        {lead.company || '—'}
      </span>

      {/* Name */}
      <span className="font-medium text-foreground truncate">
        {lead.contact_name}
      </span>

      {/* Title */}
      <span className="text-muted-foreground truncate text-[10px]">
        {lead.position || '—'}
      </span>

      {/* AI Comment Preview */}
      <p className="text-muted-foreground truncate">
        {lead.ai_comment || lead.post_content || '—'}
      </p>

      {/* Recency Badge */}
      <div className="flex justify-center">
        {getRecencyBadge()}
      </div>

      {/* Relevancy Badge */}
      <div className="flex justify-end">
        {getRelevancyBadge()}
      </div>
    </div>
  );
}