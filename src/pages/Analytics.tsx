import { useLeads } from "@/hooks/useLeads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import { Send, MessageSquare, XCircle, TrendingUp } from "lucide-react";

export default function Analytics() {
  const { leads, sentLeads, commentedLeads, rejectedLeads, isLoading } = useLeads();

  // Generate last 7 days data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayStart = startOfDay(date);

    const incoming = leads.filter((l) =>
      isSameDay(new Date(l.created_at), dayStart)
    ).length;

    const sent = leads.filter(
      (l) => l.sent_at && isSameDay(new Date(l.sent_at), dayStart)
    ).length;

    const commented = leads.filter(
      (l) => l.status === "commented" && isSameDay(new Date(l.created_at), dayStart)
    ).length;

    return {
      date: format(date, "MMM d"),
      incoming,
      sent,
      commented,
    };
  });

  const stats = [
    {
      title: "Total Sent",
      value: sentLeads.length,
      icon: Send,
      color: "text-primary",
    },
    {
      title: "Commented",
      value: commentedLeads.length,
      icon: MessageSquare,
      color: "text-accent",
    },
    {
      title: "Rejected",
      value: rejectedLeads.length,
      icon: XCircle,
      color: "text-destructive",
    },
    {
      title: "Conversion Rate",
      value: leads.length > 0 ? `${Math.round((sentLeads.length / leads.length) * 100)}%` : "0%",
      icon: TrendingUp,
      color: "text-success",
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">Analytics</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold font-display">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Leads Activity (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Bar dataKey="incoming" fill="hsl(var(--primary))" name="Incoming" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sent" fill="hsl(var(--accent))" name="Sent" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Outreach Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sent"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                    name="Sent"
                  />
                  <Line
                    type="monotone"
                    dataKey="commented"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--accent))" }}
                    name="Commented"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rejections List */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Rejection Reasons</CardTitle>
        </CardHeader>
        <CardContent>
          {rejectedLeads.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No rejections yet</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-auto">
              {rejectedLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{lead.contact_name}</span>
                      {lead.company && (
                        <Badge variant="outline">{lead.company}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {lead.rejection_feedback || "No feedback provided"}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(lead.created_at), "MMM d, yyyy")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
