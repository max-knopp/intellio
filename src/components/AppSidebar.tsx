import { Inbox, BarChart3, Users, PanelLeftClose, PanelLeft, Zap, LogOut, HelpCircle, Settings } from "lucide-react";
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
  { title: "Contacts", url: "/contacts", icon: Users },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help", url: "/help", icon: HelpCircle },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const { user, signOut } = useAuth();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 bg-background/50">
      <SidebarContent className="py-4">
        {/* Logo */}
        <div className={`flex items-center gap-2 px-3 mb-4 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-7 h-7 rounded-lg bg-primary/80 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && <span className="font-display text-base font-medium text-foreground">Intell.io</span>}
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent/70 text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
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
      <SidebarFooter className="p-3 border-t border-border/50 space-y-2">
        {/* User Email & Sign Out */}
        {user && (
          <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}>
            {!collapsed && <span className="text-xs text-muted-foreground truncate flex-1">{user.email}</span>}
            <Button variant="ghost" size="sm" onClick={signOut} className="flex-shrink-0 h-7 px-2" title="Sign out">
              <LogOut className="h-3.5 w-3.5" />
              {!collapsed && <span className="ml-1.5 text-xs">Sign out</span>}
            </Button>
          </div>
        )}

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className={`w-full h-7 ${collapsed ? "justify-center" : "justify-start"}`}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4 mr-1.5" />
              <span className="text-xs">Hide</span>
            </>
          )}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
