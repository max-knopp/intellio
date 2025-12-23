import { Inbox, BarChart3, Mic, PanelLeftClose, PanelLeft, Zap, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { title: "Lead Inbox", url: "/", icon: Inbox },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Podcast Leads", url: "/podcasts", icon: Mic },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const { user, signOut } = useAuth();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="py-6">
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 mb-8 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && <span className="font-display text-xl font-semibold text-foreground">Intell.io</span>}
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 px-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with User Info and Toggle */}
      <SidebarFooter className="p-4 border-t border-border space-y-3">
        {/* User Email & Sign Out */}
        {user && (
          <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}>
            {!collapsed && <span className="text-sm text-muted-foreground truncate flex-1">{user.email}</span>}
            <Button variant="ghost" size="sm" onClick={signOut} className="flex-shrink-0" title="Sign out">
              <LogOut className="h-4 w-4" />
              {!collapsed && <span className="ml-2">Sign out</span>}
            </Button>
          </div>
        )}

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className={`w-full ${collapsed ? "justify-center" : "justify-start"}`}
        >
          {collapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <>
              <PanelLeftClose className="h-5 w-5 mr-2" />
              <span>Hide Menu</span>
            </>
          )}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
