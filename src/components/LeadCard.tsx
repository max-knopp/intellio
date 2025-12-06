import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Check, X, ExternalLink, Edit3, Sparkles } from 'lucide-react';
import { Lead } from '@/hooks/useLeads';
import { format } from 'date-fns';

interface LeadCardProps {
  lead: Lead;
  onSend: (id: string, message: string) => void;
  onReject: (id: string, feedback?: string) => void;
  isLoading?: boolean;
}

export function LeadCard({ lead, onSend, onReject, isLoading }: LeadCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(lead.ai_message);
  const [showRejectFeedback, setShowRejectFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'bg-muted text-muted-foreground';
    if (score >= 80) return 'bg-success text-success-foreground';
    if (score >= 60) return 'bg-warning text-warning-foreground';
    return 'bg-muted text-muted-foreground';
  };

  const handleSend = () => {
    onSend(lead.id, message);
  };

  const handleReject = () => {
    if (showRejectFeedback) {
      onReject(lead.id, feedback);
      setShowRejectFeedback(false);
      setFeedback('');
    } else {
      setShowRejectFeedback(true);
    }
  };

  return (
    <Card className="overflow-hidden animate-fade-in hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-border">
              <AvatarImage src={lead.profile_photo_url || undefined} alt={lead.contact_name} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(lead.contact_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-display font-semibold text-foreground">{lead.contact_name}</h3>
              <p className="text-sm text-muted-foreground">
                {lead.position}{lead.company && ` at ${lead.company}`}
              </p>
            </div>
          </div>
          {lead.relevance_score && (
            <Badge className={`${getScoreColor(lead.relevance_score)} font-medium`}>
              <Sparkles className="w-3 h-3 mr-1" />
              {lead.relevance_score}%
            </Badge>
          )}
        </div>

        {/* Post Content */}
        {lead.post_content && (
          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            <p className="text-sm text-muted-foreground line-clamp-3">{lead.post_content}</p>
            {lead.post_date && (
              <p className="text-xs text-muted-foreground/70 mt-2">
                Posted {format(new Date(lead.post_date), 'MMM d, yyyy')}
              </p>
            )}
          </div>
        )}

        {/* LinkedIn Link */}
        <a
          href={lead.linkedin_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-4"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View LinkedIn post
        </a>

        {/* AI Message */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">AI-Generated Message</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="h-7 px-2"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1" />
              {isEditing ? 'Done' : 'Edit'}
            </Button>
          </div>
          {isEditing ? (
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] text-sm resize-none"
              placeholder="Edit your message..."
            />
          ) : (
            <p className="text-sm text-foreground bg-secondary/50 rounded-lg p-3 whitespace-pre-wrap">
              {message}
            </p>
          )}
        </div>

        {/* Reject Feedback */}
        {showRejectFeedback && (
          <div className="mb-4 animate-fade-in">
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Optional: Why are you rejecting this lead?"
              className="text-sm resize-none"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleSend}
            disabled={isLoading}
            className="flex-1 bg-success hover:bg-success/90"
          >
            <Check className="w-4 h-4 mr-1.5" />
            Send
          </Button>
          <Button
            variant={showRejectFeedback ? "destructive" : "outline"}
            onClick={handleReject}
            disabled={isLoading}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-1.5" />
            {showRejectFeedback ? 'Confirm Reject' : 'Reject'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}