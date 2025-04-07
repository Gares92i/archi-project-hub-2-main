
import { supabase } from '@/integrations/supabase/client';

interface StripeCheckoutResponse {
  url: string;
  error?: string;
}

// Créer une session de paiement Stripe
export const createCheckoutSession = async (priceId: string): Promise<StripeCheckoutResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('stripe-checkout', {
      body: { priceId }
    });

    if (error) throw error;
    return data as StripeCheckoutResponse;
  } catch (error: any) {
    console.error('Erreur lors de la création de la session Stripe:', error);
    return { url: '', error: error.message || 'Erreur lors de la création de la session Stripe' };
  }
};

// Vérifier l'état de l'abonnement de l'utilisateur
export const checkSubscriptionStatus = async (): Promise<{ subscribed: boolean }> => {
  try {
    const { data, error } = await supabase.functions.invoke('check-subscription');

    if (error) throw error;
    return data as { subscribed: boolean };
  } catch (error: any) {
    console.error('Erreur lors de la vérification de l\'abonnement:', error);
    return { subscribed: false };
  }
};
