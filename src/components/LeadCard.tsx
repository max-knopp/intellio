import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, X, ExternalLink, Edit3, Sparkles, MessageSquare, Copy } from 'lucide-react';
import { Lead } from '@/hooks/useLeads';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface LeadCardProps {
  lead: Lead;
  onSend: (id: string, message: string) => void;
  onReject: (id: string, feedback?: string) => void;
  onMarkCommented?: (id: string) => void;
  isLoading?: boolean;
}

export function LeadCard({ lead, onSend, onReject, onMarkCommented, isLoading }: LeadCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(lead.ai_message);
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [comment, setComment] = useState(lead.ai_comment || '');
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

  const handleMarkCommented = () => {
    onMarkCommented?.(lead.id);
  };

  const handleCopyComment = async () => {
    try {
      await navigator.clipboard.writeText(comment);
      toast({ title: 'Copied!', description: 'Comment copied to clipboard.' });
    } catch (err) {
      toast({ title: 'Failed to copy', description: 'Please try again.', variant: 'destructive' });
    }
  };

  const showActions = lead.status === 'pending';

  return (
    <Card className="overflow-hidden animate-fade-in hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
      <CardContent className="p-4 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 h-12">
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10 border border-border flex-shrink-0">
              <AvatarImage src={lead.profile_photo_url || undefined} alt={lead.contact_name} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                {getInitials(lead.contact_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="font-display font-semibold text-foreground text-sm truncate">{lead.contact_name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {lead.position}{lead.company && ` at ${lead.company}`}
              </p>
            </div>
          </div>
          <Badge className={`${getScoreColor(lead.relevance_score)} font-medium text-xs flex-shrink-0 ${!lead.relevance_score ? 'invisible' : ''}`}>
            <Sparkles className="w-3 h-3 mr-1" />
            {lead.relevance_score || 0}%
          </Badge>
        </div>

        {/* Post Content */}
        <div className="h-16 mb-3">
          {lead.post_content ? (
            <Popover>
              <PopoverTrigger asChild>
                <div className="bg-muted/50 rounded-md p-2 cursor-pointer hover:bg-muted/70 transition-colors h-full overflow-hidden">
                  <p className="text-xs text-muted-foreground line-clamp-2">{lead.post_content}</p>
                  {lead.post_date && (
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {format(new Date(lead.post_date), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-96 max-h-80 overflow-y-auto" align="start">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-foreground">Full Post Content</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lead.post_content}</p>
                  {lead.post_date && (
                    <p className="text-xs text-muted-foreground/70 pt-2 border-t border-border">
                      Posted {format(new Date(lead.post_date), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <div className="bg-muted/30 rounded-md h-full" />
          )}
        </div>

        {/* LinkedIn Links */}
        <div className="flex items-center gap-3 h-5 mb-3">
          {lead.post_url && (
            <a
              href={lead.post_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              View Post
            </a>
          )}
          <a
            href={lead.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            View Profile
          </a>
        </div>

        {/* Suggested Comment */}
        {lead.ai_comment && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5 h-6">
              <span className="text-xs font-medium text-foreground flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                Suggested Comment
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyComment}
                  className="h-6 px-1.5 text-xs"
                  disabled={!comment}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
                {showActions && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingComment(!isEditingComment)}
                    className="h-6 px-1.5 text-xs"
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    {isEditingComment ? 'Done' : 'Edit'}
                  </Button>
                )}
              </div>
            </div>
            <div className="h-16">
              {isEditingComment ? (
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="h-full text-xs resize-none"
                  placeholder="Edit suggested comment..."
                />
              ) : (
                <p className="text-xs text-foreground bg-secondary/50 rounded-md p-2 whitespace-pre-wrap line-clamp-3 h-full overflow-hidden">
                  {comment}
                </p>
              )}
            </div>
          </div>
        )}

        {/* AI Message */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5 h-6">
            <span className="text-xs font-medium text-foreground">AI-Generated Message</span>
            {showActions && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="h-6 px-1.5 text-xs"
              >
                <Edit3 className="w-3 h-3 mr-1" />
                {isEditing ? 'Done' : 'Edit'}
              </Button>
            )}
          </div>
          <div className="h-20">
            {isEditing ? (
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="h-full text-xs resize-none"
                placeholder="Edit your message..."
              />
            ) : (
              <p className="text-xs text-foreground bg-secondary/50 rounded-md p-2 whitespace-pre-wrap line-clamp-4 h-full overflow-hidden">
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Reject Feedback */}
        {showRejectFeedback && (
          <div className="mb-3 animate-fade-in">
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Optional: Why are you rejecting this lead?"
              className="text-xs resize-none"
            />
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 mt-auto pt-3">
            <Button
              onClick={handleSend}
              disabled={isLoading}
              size="sm"
              className="flex-1 bg-success hover:bg-success/90 text-xs"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Send
            </Button>
            <Button
              variant="secondary"
              onClick={handleMarkCommented}
              disabled={isLoading}
              size="sm"
              className="flex-1 text-xs"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1" />
              Commented
            </Button>
            <Button
              variant={showRejectFeedback ? "destructive" : "outline"}
              onClick={handleReject}
              disabled={isLoading}
              size="sm"
              className="flex-1 text-xs"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              {showRejectFeedback ? 'Confirm' : 'Reject'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}