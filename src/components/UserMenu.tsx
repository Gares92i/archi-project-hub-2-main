
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useRoles } from '@/hooks/useRoles';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreditCard, LogOut, Settings, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export const UserMenu = () => {
  const { user, signOut } = useAuth();
  const { profile, getUserFullName, getInitials } = useProfile();
  const { subscription, getPlanType } = useSubscription();
  const { roles, getPrimaryRole } = useRoles();

  const getPlanBadgeVariant = () => {
    if (!subscription) return 'outline';
    switch (subscription.plan_type) {
      case 'Basique': return 'secondary';
      case 'Professionnel': return 'default';
      case 'Entreprise': return 'destructive';
      default: return 'outline';
    }
  };

  const getRoleBadge = () => {
    if (!roles || roles.length === 0) return null;
    
    const primaryRole = getPrimaryRole();
    if (!primaryRole) return null;
    
    // Configuration for role badges
    const roleConfig: Record<string, { label: string, variant: "default" | "secondary" | "destructive" | "outline" }> = {
      admin: { label: 'Admin', variant: 'destructive' },
      architect: { label: 'Architecte', variant: 'default' },
      client: { label: 'Client', variant: 'secondary' },
      contractor: { label: 'Entrepreneur', variant: 'outline' }
    };
    
    const config = roleConfig[primaryRole];
    if (!config) return null;
    
    return (
      <Badge variant={config.variant} className="ml-2">
        {config.label}
      </Badge>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || undefined} alt={getUserFullName()} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {getUserFullName()}
              {getRoleBadge()}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
            {subscription && (
              <div className="mt-2">
                <Badge variant={getPlanBadgeVariant()} className="mt-1">
                  Plan {getPlanType()}
                </Badge>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Paramètres</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/pricing">
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Abonnement</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
