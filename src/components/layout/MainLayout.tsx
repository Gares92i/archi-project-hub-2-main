import { ReactNode } from "react";
import Navbar from "../Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "../Sidebar";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PanelLeft, PanelRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

interface MainLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

const MainLayoutContent = ({ children }: MainLayoutProps) => {
  const { state, toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  const isCollapsed = state === "collapsed";

  return (
    <div className="flex-1 flex flex-col w-full">
      <Navbar />
      <div className="relative flex-1 flex">
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              "fixed z-50 bg-background shadow-sm rounded-full transition-none",
              isCollapsed ? "left-[4.5rem] top-4" : "left-[17rem] top-4"
            )}>
            {isCollapsed ? (
              <PanelRight className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
          </Button>
        )}
        <main
          className={cn(
            "flex-1 overflow-x-hidden",
            isMobile ? "p-2 pt-16" : "p-4 sm:p-6 md:p-8 lg:p-10",
            // Ajuster la marge gauche pour tenir compte de la marge de la sidebar
            !isMobile &&
              (isCollapsed ? "ml-[calc(4.5rem+8px)]" : "ml-[calc(16rem+8px)]")
          )}>
          <div className="max-w-7xl mx-auto w-full relative">{children}</div>
        </main>
      </div>
    </div>
  );
};

const MainLayout = ({ children, requireAuth = true }: MainLayoutProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (requireAuth && !isLoading && !isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full overflow-hidden bg-background">
        <Sidebar />
        <MainLayoutContent>{children}</MainLayoutContent>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
