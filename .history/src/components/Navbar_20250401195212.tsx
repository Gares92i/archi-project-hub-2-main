
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { UserMenu } from "./UserMenu";

const Navbar = () => {
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              ArchiPro
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {!isMobile && (
              <>
                <Link
                  to="/projects"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Projets
                </Link>
                <Link
                  to="/team"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Équipe
                </Link>
                <Link
                  to="/clients"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Clients
                </Link>
                <Link
                  to="/pricing"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Tarifs
                </Link>
              </>
            )}
          </nav>
        </div>
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
            <UserMenu />
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
