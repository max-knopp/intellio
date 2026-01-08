import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, X, ExternalLink, Edit3, Sparkles, MessageSquare, Copy, Flame, Thermometer, Snowflake, Calendar } from 'lucide-react';
import { Lead } from '@/hooks/useLeads';
import { getRecencyLevel } from './LeadCard';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
const REJECTION_REASONS = [{
  id: 'not_icp',
  label: 'Profile not ICP'
}, {
  id: 'not_relevant',
  label: 'Post not relevant'
}, {
  id: 'bad_quality',
  label: 'Bad quality of prewritten comment/message'
}] as const;
interface LeadDetailPanelProps {
  lead: Lead;
  onSend: (id: string, message: string) => void;
  onReject: (id: string, feedback?: string) => void;
  onMarkCommented?: (id: string) => void;
  onUpdateNotes?: (id: string, notes: string) => void;
  onUpdateMessage?: (id: string, message: string) => void;
  isLoading?: boolean;
  onClose: () => void;
}
export function LeadDetailPanel({
  lead,
  onSend,
  onReject,
  onMarkCommented,
  onUpdateNotes,
  onUpdateMessage,
  isLoading,
  onClose
}: LeadDetailPanelProps) {
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [message, setMessage] = useState(lead.ai_message);
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [comment, setComment] = useState(lead.ai_comment || '');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [otherFeedback, setOtherFeedback] = useState('');
  const [notes, setNotes] = useState(lead.notes || '');
  const [notesSaving, setNotesSaving] = useState(false);

  // Sync state when lead changes - use final_message if available, otherwise ai_message
  useEffect(() => {
    setMessage(lead.final_message || lead.ai_message);
    setComment(lead.ai_comment || '');
    setNotes(lead.notes || '');
    setIsEditingMessage(false);
    setIsEditingComment(false);
  }, [lead.id, lead.notes, lead.final_message]);
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  const getScoreColor = (score: number | null) => {
    if (!score) return 'bg-muted text-muted-foreground';
    if (score >= 80) return 'bg-success text-success-foreground';
    if (score >= 60) return 'bg-warning text-warning-foreground';
    return 'bg-muted text-muted-foreground';
  };
  const recency = getRecencyLevel(lead.post_date || lead.created_at);
  const RecencyIcon = recency === 'hot' ? Flame : recency === 'warm' ? Thermometer : Snowflake;
  const recencyLabel = recency === 'hot' ? 'Hot' : recency === 'warm' ? 'Warm' : 'Cold';
  const recencyClass = recency === 'hot' ? 'bg-orange-500/20 text-orange-600 border-orange-500/30' : recency === 'warm' ? 'bg-amber-500/20 text-amber-600 border-amber-500/30' : 'bg-blue-500/20 text-blue-600 border-blue-500/30';
  const handleSend = () => {
    onSend(lead.id, message);
  };
  const handleConfirmReject = () => {
    const predefinedReasons = selectedReasons.filter(id => id !== 'other').map(id => REJECTION_REASONS.find(r => r.id === id)?.label).filter(Boolean) as string[];
    const reasons: string[] = [...predefinedReasons];
    if (selectedReasons.includes('other') && otherFeedback.trim()) {
      reasons.push(otherFeedback.trim());
    }
    onReject(lead.id, reasons.join(', ') || undefined);
    setShowRejectDialog(false);
    setSelectedReasons([]);
    setOtherFeedback('');
  };
  const toggleReason = (reasonId: string) => {
    setSelectedReasons(prev => prev.includes(reasonId) ? prev.filter(id => id !== reasonId) : [...prev, reasonId]);
  };
  const handleCopyComment = async () => {
    try {
      await navigator.clipboard.writeText(comment);
      toast({
        title: 'Copied!',
        description: 'Comment copied to clipboard.'
      });
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again.',
        variant: 'destructive'
      });
    }
  };
  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message);
      toast({
        title: 'Copied!',
        description: 'Message copied to clipboard.'
      });
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again.',
        variant: 'destructive'
      });
    }
  };
  const handleSaveNotes = async () => {
    if (onUpdateNotes && notes !== lead.notes) {
      setNotesSaving(true);
      onUpdateNotes(lead.id, notes);
      setTimeout(() => setNotesSaving(false), 500);
    }
  };

  const handleToggleEditMessage = () => {
    if (isEditingMessage) {
      // Saving - check if message changed from original
      const originalMessage = lead.final_message || lead.ai_message;
      if (message !== originalMessage && onUpdateMessage) {
        onUpdateMessage(lead.id, message);
      }
    }
    setIsEditingMessage(!isEditingMessage);
  };

  const showActions = lead.status === 'pending';
  return <div className="h-full flex flex-col bg-card border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border border-border">
            <AvatarImage src={lead.profile_photo_url || undefined} alt={lead.contact_name} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(lead.contact_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-foreground">{lead.contact_name}</h2>
            <p className="text-sm text-muted-foreground">
              {lead.position}{lead.company && ` at ${lead.company}`}
            </p>
          </div>
        </div>
        {/* Hide close button on mobile since Sheet provides one */}
        <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground hidden md:flex">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <Badge className={recencyClass}>
          <RecencyIcon className="w-3 h-3 mr-1" />
          {recencyLabel}
        </Badge>
        {lead.relevance_score && <Badge className={getScoreColor(lead.relevance_score)}>
            <Sparkles className="w-3 h-3 mr-1" />
            {lead.relevance_score}% match
          </Badge>}
        {lead.post_date && <Badge variant="outline" className="text-muted-foreground">
            <Calendar className="w-3 h-3 mr-1" />
            {format(new Date(lead.post_date), 'MMM d, yyyy')}
          </Badge>}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Links */}
          <div className="flex items-center gap-4">
            {lead.post_url && <a href={lead.post_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                <ExternalLink className="w-4 h-4" />
                View Post
              </a>}
            <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
              <ExternalLink className="w-4 h-4" />
              View Profile
            </a>
          </div>

          {/* Post Content */}
          {lead.post_content && <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Post Content</h3>
              <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {lead.post_content}
                </p>
              </div>
            </div>}

          {/* Suggested Comment */}
          {lead.ai_comment && <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  Suggested Comment
                </h3>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={handleCopyComment} className="h-7 text-xs">
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                  {showActions && <Button variant="ghost" size="sm" onClick={() => setIsEditingComment(!isEditingComment)} className="h-7 text-xs">
                      <Edit3 className="w-3 h-3 mr-1" />
                      {isEditingComment ? 'Done' : 'Edit'}
                    </Button>}
                </div>
              </div>
              {isEditingComment ? <Textarea value={comment} onChange={e => setComment(e.target.value)} className="min-h-24 text-sm resize-none" /> : <div className="rounded-lg p-4 border border-primary/40 bg-primary/5">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{comment}</p>
                </div>}
            </div>}

          {/* AI Message */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                AI-Generated Message
              </h3>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={handleCopyMessage} className="h-7 text-xs">
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
                {showActions && <Button variant="ghost" size="sm" onClick={handleToggleEditMessage} className="h-7 text-xs">
                    <Edit3 className="w-3 h-3 mr-1" />
                    {isEditingMessage ? 'Done' : 'Edit'}
                  </Button>}
              </div>
            </div>
            {isEditingMessage ? <Textarea value={message} onChange={e => setMessage(e.target.value)} className="min-h-32 text-sm resize-none" /> : <div className="rounded-lg p-4 border border-primary/40 bg-primary/5">
                <p className="text-sm text-foreground whitespace-pre-wrap">{message}</p>
              </div>}
          </div>

          {/* Rejection Feedback (for rejected leads) */}
          {lead.status === 'rejected' && lead.rejection_feedback && <div>
              <h3 className="text-sm font-medium text-destructive mb-2">Rejection Reason</h3>
              <div className="bg-destructive/10 rounded-lg p-4">
                <p className="text-sm text-foreground">{lead.rejection_feedback}</p>
              </div>
            </div>}
        </div>
      </ScrollArea>

      {/* Actions */}
      {showActions && <div className="p-3 border-t border-border bg-card shrink-0">
          <div className="flex gap-1.5">
            <Button size="sm" onClick={handleSend} disabled={isLoading} className="flex-1 bg-success hover:bg-success/90 text-xs">
              <Check className="w-3.5 h-3.5 mr-1" />
              Sent
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onMarkCommented?.(lead.id)} disabled={isLoading} className="flex-1 text-xs">
              <MessageSquare className="w-3.5 h-3.5 mr-1" />
              Commented
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowRejectDialog(true)} disabled={isLoading} className="flex-1 text-xs hover:bg-destructive hover:text-destructive-foreground hover:border-destructive">
              <X className="w-3.5 h-3.5 mr-1" />
              Reject
            </Button>
          </div>
        </div>}

      {/* Notes Section */}
      <div className="p-4 border-t border-border bg-card shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes</h3>
          {notes !== lead.notes && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleSaveNotes} 
              disabled={notesSaving}
              className="h-6 text-xs px-2"
            >
              {notesSaving ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleSaveNotes}
          placeholder="Add notes about lead quality, message quality, or anything else..."
          className="min-h-20 text-sm resize-none"
        />
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Lead</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">Select the reasons for rejection:</p>
            <div className="space-y-3">
              {REJECTION_REASONS.map(reason => <div key={reason.id} className="flex items-center space-x-3">
                  <Checkbox id={reason.id} checked={selectedReasons.includes(reason.id)} onCheckedChange={() => toggleReason(reason.id)} />
                  <label htmlFor={reason.id} className="text-sm font-medium leading-none cursor-pointer">
                    {reason.label}
                  </label>
                </div>)}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Checkbox id="other" checked={selectedReasons.includes('other')} onCheckedChange={() => toggleReason('other')} />
                  <label htmlFor="other" className="text-sm font-medium leading-none cursor-pointer">
                    Other
                  </label>
                </div>
                {selectedReasons.includes('other') && (
                  <div className="pl-6">
                    <Textarea value={otherFeedback} onChange={e => setOtherFeedback(e.target.value)} placeholder="Enter custom feedback..." className="text-sm resize-none w-full" rows={2} />
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmReject} disabled={selectedReasons.length === 0}>
              Reject Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}