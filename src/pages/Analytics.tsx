import { useMemo } from "react";
import { useLeads } from "@/hooks/useLeads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import { 
  Send, 
  MessageSquare, 
  XCircle, 
  TrendingUp, 
  Clock, 
  Sparkles, 
  UserCheck, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const CHART_COLORS = {
  primary: "hsl(220, 90%, 56%)",
  accent: "hsl(152, 60%, 45%)",
  warning: "hsl(38, 92%, 50%)",
  destructive: "hsl(0, 72%, 51%)",
  muted: "hsl(220, 10%, 46%)",
  interested: "hsl(280, 60%, 55%)",
  converted: "hsl(160, 80%, 40%)",
};

export default function Analytics() {
  const { 
    leads, 
    pendingLeads,
    sentLeads, 
    commentedLeads, 
    rejectedLeads,
    interestedLeads,
    convertedLeads,
    isLoading 
  } = useLeads();

  // Generate last 14 days data
  const last14Days = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const date = subDays(new Date(), 13 - i);
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

      const interested = leads.filter(
        (l) => l.status === "interested" && isSameDay(new Date(l.created_at), dayStart)
      ).length;

      const converted = leads.filter(
        (l) => l.status === "converted" && isSameDay(new Date(l.created_at), dayStart)
      ).length;

      return {
        date: format(date, "MMM d"),
        incoming,
        sent,
        commented,
        interested,
        converted,
      };
    });
  }, [leads]);

  // Rejection reasons categorized
  const rejectionCategories = useMemo(() => {
    const categories: Record<string, number> = {
      "No feedback": 0,
      "Not relevant": 0,
      "Bad timing": 0,
      "Wrong person": 0,
      "Content issue": 0,
      "Other": 0,
    };

    rejectedLeads.forEach((lead) => {
      const feedback = lead.rejection_feedback?.toLowerCase() || "";
      if (!lead.rejection_feedback) {
        categories["No feedback"]++;
      } else if (feedback.includes("relevant") || feedback.includes("fit") || feedback.includes("match")) {
        categories["Not relevant"]++;
      } else if (feedback.includes("time") || feedback.includes("later") || feedback.includes("busy")) {
        categories["Bad timing"]++;
      } else if (feedback.includes("person") || feedback.includes("wrong") || feedback.includes("contact")) {
        categories["Wrong person"]++;
      } else if (feedback.includes("message") || feedback.includes("content") || feedback.includes("text")) {
        categories["Content issue"]++;
      } else {
        categories["Other"]++;
      }
    });

    return Object.entries(categories)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [rejectedLeads]);

  // Pipeline funnel data
  const pipelineData = useMemo(() => [
    { name: "Pending", value: pendingLeads.length, color: CHART_COLORS.muted },
    { name: "Commented", value: commentedLeads.length, color: CHART_COLORS.warning },
    { name: "Sent", value: sentLeads.length, color: CHART_COLORS.primary },
    { name: "Interested", value: interestedLeads.length, color: CHART_COLORS.interested },
    { name: "Converted", value: convertedLeads.length, color: CHART_COLORS.converted },
    { name: "Rejected", value: rejectedLeads.length, color: CHART_COLORS.destructive },
  ], [pendingLeads, commentedLeads, sentLeads, interestedLeads, convertedLeads, rejectedLeads]);

  // Calculate rates
  const conversionRate = leads.length > 0 
    ? Math.round((convertedLeads.length / leads.length) * 100) 
    : 0;
  
  const interestRate = leads.length > 0 
    ? Math.round((interestedLeads.length / leads.length) * 100) 
    : 0;

  const responseRate = leads.length > 0 
    ? Math.round(((sentLeads.length + commentedLeads.length) / leads.length) * 100) 
    : 0;

  const rejectionRate = leads.length > 0 
    ? Math.round((rejectedLeads.length / leads.length) * 100) 
    : 0;

  const stats = [
    {
      title: "Total Leads",
      value: leads.length,
      icon: Target,
      color: "text-foreground",
      bgColor: "bg-secondary/50",
    },
    {
      title: "Pending",
      value: pendingLeads.length,
      icon: Clock,
      color: "text-muted-foreground",
      bgColor: "bg-muted/30",
    },
    {
      title: "Commented",
      value: commentedLeads.length,
      icon: MessageSquare,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Sent",
      value: sentLeads.length,
      icon: Send,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Interested",
      value: interestedLeads.length,
      icon: Sparkles,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Converted",
      value: convertedLeads.length,
      icon: UserCheck,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  const rateStats = [
    {
      title: "Response Rate",
      value: `${responseRate}%`,
      trend: responseRate > 50 ? "up" : "down",
      description: "Sent + Commented",
    },
    {
      title: "Interest Rate",
      value: `${interestRate}%`,
      trend: interestRate > 10 ? "up" : "down",
      description: "Marked as interested",
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      trend: conversionRate > 5 ? "up" : "down",
      description: "Fully converted",
    },
    {
      title: "Rejection Rate",
      value: `${rejectionRate}%`,
      trend: rejectionRate < 30 ? "up" : "down",
      description: "Declined leads",
    },
  ];

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="grid grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-display font-semibold text-foreground">Analytics</h1>
        <span className="text-xs text-muted-foreground">Last 14 days</span>
      </div>

      {/* KPI Cards - Compact */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {stats.map((stat) => (
          <Card key={stat.title} className={`border-border/30 ${stat.bgColor}`}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <stat.icon className={`h-4 w-4 ${stat.color} flex-shrink-0`} />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground truncate">{stat.title}</p>
                  <p className="text-lg font-semibold font-display">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rate Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {rateStats.map((stat) => (
          <Card key={stat.title} className="border-border/30">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground">{stat.title}</p>
                  <p className="text-xl font-bold font-display">{stat.value}</p>
                  <p className="text-[9px] text-muted-foreground">{stat.description}</p>
                </div>
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-accent" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-destructive" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Activity Chart */}
        <Card className="lg:col-span-2 border-border/30">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-xs font-medium">Lead Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last14Days} barGap={1}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 9 }} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 9 }} 
                    tickLine={false}
                    axisLine={false}
                    width={24}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "11px",
                    }}
                  />
                  <Bar dataKey="incoming" fill={CHART_COLORS.muted} name="Incoming" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="sent" fill={CHART_COLORS.primary} name="Sent" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="converted" fill={CHART_COLORS.converted} name="Converted" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Distribution */}
        <Card className="border-border/30">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-xs font-medium">Pipeline Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pipelineData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pipelineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "11px",
                    }}
                  />
                  <Legend 
                    iconSize={8} 
                    wrapperStyle={{ fontSize: "10px" }}
                    formatter={(value) => <span className="text-muted-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Trend Chart */}
        <Card className="border-border/30">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-xs font-medium">Conversion Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={last14Days}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 9 }} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 9 }} 
                    tickLine={false}
                    axisLine={false}
                    width={24}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "11px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="interested"
                    stroke={CHART_COLORS.interested}
                    strokeWidth={2}
                    dot={{ r: 2, fill: CHART_COLORS.interested }}
                    name="Interested"
                  />
                  <Line
                    type="monotone"
                    dataKey="converted"
                    stroke={CHART_COLORS.converted}
                    strokeWidth={2}
                    dot={{ r: 2, fill: CHART_COLORS.converted }}
                    name="Converted"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Rejection Reasons */}
        <Card className="border-border/30">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-xs font-medium flex items-center gap-2">
              Rejection Reasons
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                {rejectedLeads.length} total
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {rejectionCategories.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No rejections yet</p>
            ) : (
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rejectionCategories} layout="vertical" barSize={14}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      tick={{ fontSize: 9 }} 
                      tickLine={false}
                      axisLine={false}
                      width={70}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                        fontSize: "11px",
                      }}
                    />
                    <Bar dataKey="value" fill={CHART_COLORS.destructive} radius={[0, 4, 4, 0]} name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rejections List */}
      <Card className="border-border/30">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-xs font-medium">Recent Rejections</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {rejectedLeads.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No rejections yet</p>
          ) : (
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {rejectedLeads.slice(0, 10).map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-start gap-3 p-2 rounded-md bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <XCircle className="h-3.5 w-3.5 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium truncate">{lead.contact_name}</span>
                        {lead.company && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                            {lead.company}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                        {lead.rejection_feedback || "No feedback provided"}
                      </p>
                    </div>
                    <span className="text-[9px] text-muted-foreground flex-shrink-0">
                      {format(new Date(lead.created_at), "MMM d")}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
