
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { createCheckoutSession } from '@/components/services/stripeService';

const pricingPlans = [
  {
    name: 'Basique',
    description: 'Pour les architectes indépendants',
    price: '29€',
    priceId: 'price_basique',
    features: [
      'Jusqu\'à 5 projets',
      'Gestion des tâches',
      'Stockage de documents 5GB',
      'Support par email',
    ],
    popular: false,
  },
  {
    name: 'Professionnel',
    description: 'Pour les petites agences',
    price: '79€',
    priceId: 'price_pro',
    features: [
      'Jusqu\'à 20 projets',
      'Gestion des tâches avancée',
      'Stockage de documents 20GB',
      'Rapports de chantier',
      'Support prioritaire',
      'Collaboration d\'équipe',
    ],
    popular: true,
  },
  {
    name: 'Entreprise',
    description: 'Pour les grandes agences',
    price: '199€',
    priceId: 'price_enterprise',
    features: [
      'Projets illimités',
      'Gestion des tâches avancée',
      'Stockage de documents 100GB',
      'Rapports de chantier avancés',
      'Support dédié',
      'Collaboration d\'équipe avancée',
      'API et intégrations',
    ],
    popular: false,
  },
];

const Pricing = () => {
  const { isAuthenticated, subscription } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Si l'utilisateur est déjà abonné et sur le plan "pro", on le redirige
  useEffect(() => {
    if (subscription && subscription.status === 'active') {
      toast.info(`Vous êtes déjà abonné au plan ${subscription.plan_type}`);
    }
  }, [subscription]);

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: { pathname: '/pricing' } } });
      return;
    }

    try {
      setIsLoading(planId);
      const { url, error } = await createCheckoutSession(planId);
      
      if (error) {
        throw new Error(error);
      }
      
      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue lors de la souscription');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-7xl">
        <div className="mx-auto text-center mb-12">
          <h1 className="text-3xl font-bold sm:text-4xl">Tarifs et abonnements</h1>
          <p className="mt-4 text-muted-foreground max-w-prose mx-auto">
            Choisissez le forfait qui correspond à vos besoins. Tous les abonnements sont facturés mensuellement et peuvent être annulés à tout moment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <Card 
              key={plan.name} 
              className={plan.popular ? 'border-primary shadow-lg relative' : ''}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    Populaire
                  </div>
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">/mois</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-4 w-4 text-primary mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(plan.priceId)}
                  disabled={isLoading === plan.priceId}
                >
                  {isLoading === plan.priceId ? 'Chargement...' : 'S\'abonner'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 bg-muted rounded-lg p-6">
          <h3 className="text-xl font-medium mb-4">Questions fréquentes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Puis-je changer de forfait ?</h4>
              <p className="text-muted-foreground">Oui, vous pouvez passer à un forfait supérieur ou inférieur à tout moment. Le changement prendra effet à la fin de votre période de facturation en cours.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Comment annuler mon abonnement ?</h4>
              <p className="text-muted-foreground">Vous pouvez annuler votre abonnement à tout moment depuis votre compte. Votre abonnement restera actif jusqu'à la fin de la période de facturation en cours.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Y a-t-il un essai gratuit ?</h4>
              <p className="text-muted-foreground">Oui, nous offrons un essai gratuit de 14 jours pour tous nos forfaits. Aucune carte de crédit n'est requise pendant l'essai.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Comment fonctionne la facturation ?</h4>
              <p className="text-muted-foreground">Nous utilisons Stripe pour traiter tous les paiements. Votre abonnement sera automatiquement renouvelé à la fin de chaque période de facturation.</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Pricing;
