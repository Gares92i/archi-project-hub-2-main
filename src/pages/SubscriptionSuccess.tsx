
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { checkSubscriptionStatus } from '@/components/services/stripeService';

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') || 'Standard';
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    const verifySubscription = async () => {
      try {
        setLoading(true);
        await checkSubscriptionStatus();
        // La vérification est terminée, peu importe le résultat
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors de la vérification de l\'abonnement');
        setLoading(false);
      }
    };

    verifySubscription();
  }, [isAuthenticated, navigate]);

  const handleGoToProjects = () => {
    navigate('/projects');
  };

  const handleGoToSettings = () => {
    navigate('/settings');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h3 className="text-xl font-medium mb-2">Traitement de votre abonnement...</h3>
          <p className="text-muted-foreground">Veuillez patienter pendant que nous configurons votre compte.</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="text-destructive mb-4">Une erreur est survenue</div>
          <h3 className="text-xl font-medium mb-2">Impossible de vérifier votre abonnement</h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate('/pricing')}>Retour aux tarifs</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-2xl mx-auto px-4 py-10">
        <Card className="border-green-500">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Abonnement réussi !</CardTitle>
            <CardDescription>
              Merci d'avoir souscrit au plan <span className="font-semibold">{plan}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <p>
                Votre abonnement est maintenant actif et vous avez accès à toutes les fonctionnalités du plan {plan}.
              </p>
              <div className="bg-muted p-4 rounded-md">
                <h4 className="font-medium mb-2">Prochaines étapes :</h4>
                <ul className="list-disc list-inside text-left space-y-1 text-muted-foreground">
                  <li>Créez votre équipe et invitez des collaborateurs</li>
                  <li>Configurez votre premier projet</li>
                  <li>Explorez toutes les fonctionnalités disponibles</li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={handleGoToSettings}>
              Gérer mon abonnement
            </Button>
            <Button onClick={handleGoToProjects}>
              Commencer à utiliser ArchiPro
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SubscriptionSuccess;
