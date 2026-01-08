import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Building2, Users, Mail, Crown, Shield, User, Trash2, X, Loader2 } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { organization, members, invites, userRole, isLoading, createOrganization, inviteMember, removeMember, cancelInvite } = useOrganization();
  const { toast } = useToast();
  
  const [orgName, setOrgName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [isCreating, setIsCreating] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;
    
    setIsCreating(true);
    try {
      await createOrganization(orgName.trim());
      setOrgName('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    
    setIsInviting(true);
    try {
      await inviteMember(inviteEmail.trim(), inviteRole);
      setInviteEmail('');
      setInviteRole('member');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsInviting(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-3 w-3" />;
      case 'admin': return <Shield className="h-3 w-3" />;
      default: return <User className="h-3 w-3" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default';
      case 'admin': return 'secondary';
      default: return 'outline';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // NOTE: This client-side role check is for UX purposes only (hiding/showing UI elements).
  // SECURITY: Actual authorization is enforced server-side via RLS policies on org_members
  // and org_invites tables. Even if this check is bypassed via browser dev tools, the
  // database will reject unauthorized operations. See RLS policies for the real security boundary.
  const canManageMembers = userRole === 'owner' || userRole === 'admin';

  return (
    <div className="p-4 md:p-6 lg:container max-w-4xl space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl md:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your organization and team members</p>
      </div>

      {!organization ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Create Organization
            </CardTitle>
            <CardDescription>
              Create an organization to invite team members and share leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOrg} className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="org-name" className="sr-only">Organization Name</Label>
                <Input
                  id="org-name"
                  placeholder="Organization name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={isCreating || !orgName.trim()}>
                {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {organization.name}
              </CardTitle>
              <CardDescription>
                Your organization settings and team management
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>
                {members.length} member{members.length !== 1 ? 's' : ''} in your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs">
                        {getInitials(member.profile?.name || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.profile?.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(member.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getRoleBadgeVariant(member.role)} className="gap-1">
                      {getRoleIcon(member.role)}
                      {member.role}
                    </Badge>
                    {canManageMembers && member.role !== 'owner' && member.user_id !== user?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {canManageMembers && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Invite Members
                </CardTitle>
                <CardDescription>
                  Invite new members to join your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleInvite} className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="invite-email" className="sr-only">Email</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="colleague@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as 'admin' | 'member')}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit" disabled={isInviting || !inviteEmail.trim()}>
                    {isInviting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Invite
                  </Button>
                </form>

                {invites.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-medium mb-3">Pending Invitations</h4>
                      <div className="space-y-2">
                        {invites.map((invite) => (
                          <div key={invite.id} className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm">{invite.email}</p>
                                <p className="text-xs text-muted-foreground">
                                  Expires {new Date(invite.expires_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{invite.role}</Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => cancelInvite(invite.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
