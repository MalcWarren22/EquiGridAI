import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Sparkles,
  FileText,
  BarChart3,
  Plug,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/app/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "AI Recommendations",
    url: "/app/recommendations",
    icon: Sparkles,
  },
  {
    title: "Reports",
    url: "/app/reports",
    icon: FileText,
  },
  {
    title: "Summary",
    url: "/app/summary",
    icon: BarChart3,
  },
  {
    title: "Integrations",
    url: "/app/integrations",
    icon: Plug,
  },
  {
    title: "Settings",
    url: "/app/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar data-testid="app-sidebar">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2 font-bold text-lg">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm">EG</span>
          </div>
          <span>EquiGrid AI</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      data-testid={`sidebar-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          Energy optimization for a sustainable future
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
