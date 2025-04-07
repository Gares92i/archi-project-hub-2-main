import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquare } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { UserMenu } from "./UserMenu";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar";

const Navbar = () => {
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full bg-background/95 backdrop-blur transition-all duration-300 shadow-sm", // Suppression de border-b
        // Ajuster le padding pour tenir compte de la marge de la sidebar
        isCollapsed ? "pl-[calc(4rem+8px)]" : "pl-[calc(16rem+8px)]"
      )}>
      <div className="container flex h-14 items-center">
        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <>
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  Se connecter
                </Button>
              </Link>
            </>
          ) : (
            <>
              {/* Bouton notification */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge
                  variant="destructive"
                  className="h-4 w-4 p-0 flex items-center justify-center absolute -top-0.5 -right-0.5">
                  <span className="text-[10px]">3</span>
                </Badge>
              </Button>

              {/* Bouton message */}
              <Button variant="ghost" size="icon" className="relative">
                <MessageSquare className="h-5 w-5" />
                <Badge
                  variant="destructive"
                  className="h-4 w-4 p-0 flex items-center justify-center absolute -top-0.5 -right-0.5">
                  <span className="text-[10px]">5</span>
                </Badge>
              </Button>

              {/* UserMenu existant */}
              <UserMenu />
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
