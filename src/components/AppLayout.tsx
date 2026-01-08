import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Zap } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen overflow-auto">
          {/* Mobile Header - visible only on small screens */}
          <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-background sticky top-0 z-40">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/80 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-display text-sm font-medium text-foreground">Intell.io</span>
            </div>
          </header>
          <main className="flex-1 flex flex-col overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
