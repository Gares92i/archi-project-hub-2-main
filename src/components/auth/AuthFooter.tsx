
import { Button } from '@/components/ui/button';

interface AuthFooterProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AuthFooter = ({ activeTab, onTabChange }: AuthFooterProps) => {
  return (
    <p className="text-sm text-muted-foreground">
      {activeTab === 'login' 
        ? "Pas encore de compte ? " 
        : "Vous avez déjà un compte ? "}
      <Button 
        type="button" 
        variant="link"
        className="p-0 h-auto font-medium"
        onClick={() => onTabChange(activeTab === 'login' ? 'signup' : 'login')}
      >
        {activeTab === 'login' ? 'Créer un compte' : 'Se connecter'}
      </Button>
    </p>
  );
};

export default AuthFooter;
