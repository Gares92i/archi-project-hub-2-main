import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  BarChart,
  GanttChartSquare,
  Home,
  Calendar,
  Building2,
  FileText,
  Users,
  Settings,
  Menu,
  X,
  CheckSquare,
  Briefcase,
  MessageSquare,
} from "lucide-react";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
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
  const { state, toggleSidebar } = useSidebar();
  const [openMobile, setOpenMobile] = useState(false);
  const isCollapsed = state === "collapsed";

  useEffect(() => {
    setOpenMobile(false);
  }, [location.pathname]);

  return (
    <>
      {/* Header mobile */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-background border-b shadow-sm">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-lg">
            ArchiPro
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpenMobile(!openMobile)}>
            {openMobile ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      )}

      {/* Sidebar principale - avec ombre et contour */}
      {!isMobile && (
        <ShadcnSidebar
          className={cn(
            "fixed z-50 h-[calc(100vh-16px)] bg-background border transition-width duration-300 shadow-sm rounded-lg m-2", // Ajout de m-2 pour le padding et h-[calc(100vh-16px)] pour ajuster la hauteur
            isCollapsed ? "w-16" : "w-64"
          )}>
          <SidebarHeader className="flex items-center justify-between p-4">
            {" "}
            {/* Suppression de border-b */}
            <Link
              to="/"
              className={cn(
                "flex items-center gap-2 font-semibold text-lg",
                isCollapsed && "opacity-0"
              )}>
              ArchiPro
            </Link>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={
                      location.pathname === item.href ||
                      (location.pathname.startsWith("/projects/") &&
                        item.href === "/projects")
                    }
                    asChild
                    tooltip={isCollapsed ? item.title : undefined}
                    className={cn(
                      "flex items-center py-2",
                      isCollapsed ? "justify-center px-0" : "justify-start px-3"
                    )}>
                    <Link to={item.href} className="w-full flex items-center">
                      <div
                        className={cn(
                          "flex items-center justify-center min-w-[40px]",
                          !isCollapsed && "mr-2"
                        )}>
                        {item.icon}
                      </div>
                      {!isCollapsed && (
                        <span className="text-sm">{item.title}</span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </ShadcnSidebar>
      )}

      {/* Overlay mobile */}
      {isMobile && openMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpenMobile(false)}
        />
      )}

      {/* Menu mobile */}
      {isMobile && (
        <div
          className={cn(
            "fixed top-[4rem] left-0 z-50 h-[calc(100vh-4rem)] w-64 bg-background border-r transition-transform duration-300 shadow-lg",
            openMobile ? "translate-x-0" : "-translate-x-full"
          )}>
          <div className="p-4">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center p-3 rounded-lg hover:bg-accent transition-colors",
                    location.pathname === item.href && "bg-accent"
                  )}
                  onClick={() => setOpenMobile(false)}>
                  {item.icon}
                  <span className="ml-3 text-sm">{item.title}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
