import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Flame, Thermometer, Snowflake, Sparkles, Check, X, MessageSquare,
  Send, Clock, ThumbsUp, UserCheck, ArrowRight
} from 'lucide-react';

export default function Help() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Help Center</h1>
        <p className="text-muted-foreground mt-2">
          Learn how to use the lead management system effectively
        </p>
      </div>

      {/* Lead Labels Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Lead Labels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Labels help you quickly identify lead quality and timing. Here's what each label means:
          </p>

          {/* Recency Labels */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Recency Labels</h3>
            <p className="text-sm text-muted-foreground mb-4">
              These indicate how recently the lead posted content, which affects engagement timing:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30 shrink-0">
                  <Flame className="w-3 h-3 mr-1" />
                  Hot
                </Badge>
                <div>
                  <p className="text-sm font-medium text-foreground">Posted within the last 24 hours</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Best time to engage! The lead is actively posting and more likely to respond to outreach.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 shrink-0">
                  <Thermometer className="w-3 h-3 mr-1" />
                  Warm
                </Badge>
                <div>
                  <p className="text-sm font-medium text-foreground">Posted within the last 7 days</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Good timing for engagement. The content is still relevant and the lead is reasonably active.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30 shrink-0">
                  <Snowflake className="w-3 h-3 mr-1" />
                  Cold
                </Badge>
                <div>
                  <p className="text-sm font-medium text-foreground">Posted more than 7 days ago</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    The post is older. Consider if the topic is still relevant before reaching out.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Relevance Score */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Relevance Score</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The AI-calculated match percentage indicates how well the lead fits your ideal customer profile:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Badge className="bg-success text-success-foreground shrink-0">
                  <Sparkles className="w-3 h-3 mr-1" />
                  80%+ match
                </Badge>
                <div>
                  <p className="text-sm font-medium text-foreground">High Relevance</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Excellent fit! This lead closely matches your target profile and is worth prioritizing.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Badge className="bg-warning text-warning-foreground shrink-0">
                  <Sparkles className="w-3 h-3 mr-1" />
                  60-79% match
                </Badge>
                <div>
                  <p className="text-sm font-medium text-foreground">Medium Relevance</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Good potential. Review the details to decide if this lead is worth pursuing.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Badge className="bg-muted text-muted-foreground shrink-0">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Below 60%
                </Badge>
                <div>
                  <p className="text-sm font-medium text-foreground">Low Relevance</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    May not be a strong fit. Consider rejecting unless there are compelling reasons to engage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lead Stages Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-primary" />
            Lead Stages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Leads progress through different stages as you work with them:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Pending</p>
                <p className="text-xs text-muted-foreground mt-1">
                  New leads waiting for your review. These appear in your inbox and require action.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Commented</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You've left a comment on their post but haven't sent a direct message yet.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                <Send className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Sent</p>
                <p className="text-xs text-muted-foreground mt-1">
                  The outreach message has been approved and sent to the lead via Cargo.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                <ThumbsUp className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Interested</p>
                <p className="text-xs text-muted-foreground mt-1">
                  The lead has responded positively and shown interest in your offering.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Converted</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Success! The lead has converted into a customer or completed the desired action.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                <X className="w-4 h-4 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Rejected</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You've decided not to pursue this lead. The rejection reason is saved for AI learning.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="w-5 h-5 text-primary" />
            Lead Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            When reviewing pending leads, you have three main actions available:
          </p>

          <div className="space-y-4">
            {/* Send Action */}
            <div className="p-4 rounded-lg border border-success/30 bg-success/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-success flex items-center justify-center">
                  <Check className="w-4 h-4 text-success-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">Send</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Approves and sends the outreach message to the lead.
              </p>
              <div className="text-xs space-y-1.5 text-muted-foreground">
                <p><span className="font-medium text-foreground">What happens:</span></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>The AI-generated message (with any edits you made) is sent to Cargo API</li>
                  <li>Cargo processes the message and delivers it to the lead via LinkedIn</li>
                  <li>The lead status changes to "Sent"</li>
                  <li>A timestamp is recorded for when the message was sent</li>
                  <li>The API call is logged for tracking and debugging</li>
                </ul>
              </div>
            </div>

            {/* Commented Action */}
            <div className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-foreground">Commented</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Marks that you've manually left a comment on the lead's post.
              </p>
              <div className="text-xs space-y-1.5 text-muted-foreground">
                <p><span className="font-medium text-foreground">What happens:</span></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>The lead status changes to "Commented"</li>
                  <li>The lead moves out of the pending inbox</li>
                  <li>You can copy the suggested comment to post manually on LinkedIn</li>
                  <li>No message is sent through Cargo - this is for manual engagement</li>
                  <li>The lead can still be converted to "Sent" later if needed</li>
                </ul>
              </div>
            </div>

            {/* Reject Action */}
            <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-destructive flex items-center justify-center">
                  <X className="w-4 h-4 text-destructive-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">Reject</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Declines the lead and removes it from your active pipeline.
              </p>
              <div className="text-xs space-y-1.5 text-muted-foreground">
                <p><span className="font-medium text-foreground">What happens:</span></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>A dialog appears asking for rejection reasons</li>
                  <li>You can select predefined reasons or add custom feedback</li>
                  <li>The lead status changes to "Rejected"</li>
                  <li>Rejection feedback is saved and can be used to improve AI targeting</li>
                  <li>The lead is removed from your pending inbox</li>
                </ul>
                <p className="mt-2"><span className="font-medium text-foreground">Rejection reasons:</span></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><span className="font-medium">Profile not ICP</span> - The person doesn't match your ideal customer profile</li>
                  <li><span className="font-medium">Post not relevant</span> - The content they posted isn't a good conversation starter</li>
                  <li><span className="font-medium">Bad quality message</span> - The AI-generated message/comment isn't suitable</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}