
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
            variant="outline" 
            size="icon" 
            onClick={toggleSidebar}
            className="absolute left-0 top-2 z-20 bg-background shadow-md ml-1 rounded-full hidden md:flex"
          >
            {isCollapsed ? <PanelRight className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
          </Button>
        )}
        <main 
          className={cn(
            "flex-1 overflow-auto transition-all duration-300",
            isMobile 
              ? "p-2 pt-16" // Ajustement spécifique mobile
              : "p-4 sm:p-6 md:p-8 lg:p-10", // Padding responsive
            !isMobile && isCollapsed ? "pl-12" : ""
          )}
        >
          <div className="mx-auto max-w-full animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const MainLayout = ({ children, requireAuth = true }: MainLayoutProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Si l'authentification est requise et que l'utilisateur n'est pas connecté
  if (requireAuth && !isLoading && !isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full overflow-hidden">
        <Sidebar />
        <MainLayoutContent>{children}</MainLayoutContent>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
