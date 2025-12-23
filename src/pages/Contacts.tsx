import { useState, useMemo } from "react";
import { useLeads, Lead } from "@/hooks/useLeads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Building2, Briefcase, ExternalLink, Loader2 } from "lucide-react";

type LeadStatus = Lead["status"];

const statusConfig: Record<LeadStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "secondary" },
  commented: { label: "Commented", variant: "outline" },
  sent: { label: "Sent", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
  interested: { label: "Interested", variant: "default" },
  converted: { label: "Converted", variant: "default" },
};

export default function Contacts() {
  const { leads, isLoading, updateLeadStatus } = useLeads();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");

  // Deduplicate by linkedin_url, keeping the most recent lead
  const contacts = useMemo(() => {
    const urlMap = new Map<string, Lead>();
    const sortedLeads = [...leads].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    sortedLeads.forEach((lead) => {
      if (!urlMap.has(lead.linkedin_url)) {
        urlMap.set(lead.linkedin_url, lead);
      }
    });
    return Array.from(urlMap.values());
  }, [leads]);

  // Filter contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch =
        contact.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.position?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || contact.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [contacts, searchQuery, statusFilter]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    updateLeadStatus.mutate({ id: leadId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold text-foreground">Contacts</h1>
        <p className="text-muted-foreground text-sm mt-1">
          View and manage all your contacts
        </p>
      </div>

      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, company, or position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as LeadStatus | "all")}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(statusConfig).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead className="w-[300px]">Contact</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead className="w-[160px]">Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      No contacts found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContacts.map((contact) => (
                    <TableRow key={contact.id} className="border-border/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={contact.profile_photo_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(contact.contact_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">
                            {contact.contact_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {contact.company ? (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Building2 className="h-3.5 w-3.5" />
                            <span>{contact.company}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {contact.position ? (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Briefcase className="h-3.5 w-3.5" />
                            <span>{contact.position}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={contact.status}
                          onValueChange={(value) =>
                            handleStatusChange(contact.id, value as LeadStatus)
                          }
                        >
                          <SelectTrigger className="h-8 w-[140px]">
                            <Badge variant={statusConfig[contact.status].variant} className="text-xs">
                              {statusConfig[contact.status].label}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusConfig).map(([key, { label }]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-8 px-2"
                        >
                          <a
                            href={contact.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
