import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Flame, Thermometer, Snowflake, ChevronRight } from 'lucide-react';
import { Lead } from '@/hooks/useLeads';
import { getRecencyLevel } from './LeadCard';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface LeadListItemProps {
  lead: Lead;
  isSelected: boolean;
  onClick: () => void;
  gridTemplate?: string;
}

export function LeadListItem({ lead, isSelected, onClick, gridTemplate }: LeadListItemProps) {
  const isMobile = useIsMobile();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const recency = getRecencyLevel(lead.post_date || lead.created_at);

  const getRecencyBadge = () => {
    if (recency === 'hot') {
      return (
        <Badge variant="outline" className="h-5 text-[10px] px-1.5 gap-0.5 border-orange-500/50 bg-orange-500/10 text-orange-600">
          <Flame className="w-2.5 h-2.5" />
          <span className="hidden sm:inline">Hot</span>
        </Badge>
      );
    }
    if (recency === 'warm') {
      return (
        <Badge variant="outline" className="h-5 text-[10px] px-1.5 gap-0.5 border-amber-500/50 bg-amber-500/10 text-amber-600">
          <Thermometer className="w-2.5 h-2.5" />
          <span className="hidden sm:inline">Warm</span>
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="h-5 text-[10px] px-1.5 gap-0.5 border-blue-500/50 bg-blue-500/10 text-blue-600">
        <Snowflake className="w-2.5 h-2.5" />
        <span className="hidden sm:inline">Cold</span>
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

  // Mobile layout - simplified card-like design
  if (isMobile) {
    return (
      <div
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 px-3 py-3 cursor-pointer border-b border-border transition-colors",
          isSelected 
            ? "bg-primary/10 border-l-2 border-l-primary" 
            : "hover:bg-muted/50 active:bg-muted"
        )}
      >
        {/* Avatar */}
        <Avatar className="h-10 w-10 border border-border flex-shrink-0">
          <AvatarImage src={lead.profile_photo_url || undefined} alt={lead.contact_name} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
            {getInitials(lead.contact_name)}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground text-sm truncate">
              {lead.contact_name}
            </span>
            {lead.company && (
              <span className="text-xs text-primary font-medium truncate">
                @ {lead.company}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {lead.position || lead.post_content?.slice(0, 50) || '—'}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            {getRecencyBadge()}
            {getRelevancyBadge()}
          </div>
        </div>

        {/* Chevron */}
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </div>
    );
  }

  // Desktop layout - table row design
  return (
    <div
      onClick={onClick}
      className={cn(
        "grid items-center gap-4 px-3 py-2.5 cursor-pointer border-b border-border transition-colors text-[13px]",
        isSelected 
          ? "bg-primary/10 border-l-2 border-l-primary" 
          : "hover:bg-muted/50"
      )}
      style={{ gridTemplateColumns: gridTemplate || '32px 100px 140px 120px 1fr 60px 50px' }}
    >
      {/* Avatar */}
      <Avatar className="h-7 w-7 border border-border flex-shrink-0">
        <AvatarImage src={lead.profile_photo_url || undefined} alt={lead.contact_name} />
        <AvatarFallback className="bg-primary/10 text-primary font-medium text-[10px]">
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
      <span className="text-muted-foreground truncate">
        {lead.position || '—'}
      </span>

      {/* Post Content Preview */}
      <p className="text-muted-foreground truncate">
        {lead.post_content || '—'}
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