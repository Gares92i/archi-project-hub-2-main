
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  BarChart, GanttChartSquare, Home, Calendar, Building2, FileText,
  Users, Settings, Menu, X, CheckSquare, Briefcase, PanelLeft, MessageSquare
} from "lucide-react";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import { useTheme } from "@/contexts/ThemeContext";

const menuItems = [
  {
    title: "Tableau de bord",
    href: "/",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Projets",
    href: "/projects",
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    title: "Clients",
    href: "/clients",
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    title: "Équipe",
    href: "/team",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Tâches",
    href: "/tasks",
    icon: <CheckSquare className="h-5 w-5" />,
  },
  {
    title: "Messagerie",
    href: "/chat",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    title: "Calendrier",
    href: "/calendar",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: "Gantt",
    href: "/gantt",
    icon: <GanttChartSquare className="h-5 w-5" />,
  },
  {
    title: "Documents",
    href: "/documents",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Rapports",
    href: "/resources",
    icon: <BarChart className="h-5 w-5" />,
  },
  {
    title: "Paramètres",
    href: "/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

export default function Sidebar() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { state } = useSidebar();
  const [openMobile, setOpenMobile] = useState(false);
  const isCollapsed = state === "collapsed";
  const { theme } = useTheme();

  useEffect(() => {
    setOpenMobile(false);
  }, [location.pathname]);

  return (
    <>
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-background border-b shadow-sm">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
            ArchiPro
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpenMobile(!openMobile)}
          >
            {openMobile ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      )}

      <ShadcnSidebar className={cn(
        isCollapsed ? "sidebar-collapsed" : ""
      )}>
        <SidebarHeader className="flex items-center justify-between p-4 border-b">
          <Link to="/" className={cn(
            "flex items-center gap-2 font-semibold text-lg transition-opacity duration-300",
            isCollapsed ? "opacity-0" : "opacity-100"
          )}>
            ArchiPro
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton 
                  isActive={location.pathname === item.href || (location.pathname.startsWith('/projects/') && item.href === '/projects')}
                  asChild
                  tooltip={item.title}
                  className={cn(
                    "sync-sidebar-item",
                    (location.pathname === item.href || (location.pathname.startsWith('/projects/') && item.href === '/projects')) && "active"
                  )}
                >
                  <Link to={item.href}>
                    {item.icon}
                    <span className="text-sm">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </ShadcnSidebar>

      {isMobile && openMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpenMobile(false)}
        />
      )}

      {isMobile && (
        <div 
          className={cn(
            "fixed top-[4rem] left-0 z-50 h-[calc(100vh-4rem)] w-64 bg-background border-r transition-transform duration-300 overflow-y-auto",
            openMobile ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="px-3 py-4">
            <ul className="space-y-2 font-medium">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center p-3 rounded-lg hover:bg-accent group transition-colors",
                      (location.pathname === item.href || (location.pathname.startsWith('/projects/') && item.href === '/projects')) && "bg-accent"
                    )}
                    onClick={() => setOpenMobile(false)}
                  >
                    {item.icon}
                    <span className="ml-3 text-sm">{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
