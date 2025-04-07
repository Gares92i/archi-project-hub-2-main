
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );

  try {
    // Get the session or user object
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      return new Response(
        JSON.stringify({ subscribed: false }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Vérifier d'abord dans la base de données
    const { data: subscription, error: dbError } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (subscription) {
      return new Response(
        JSON.stringify({
          subscribed: true,
          subscription: subscription
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Si pas de souscription en base, vérifier avec Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const email = user.email;

    if (!email) {
      return new Response(
        JSON.stringify({ subscribed: false }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Get customer by email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    if (customers.data.length === 0) {
      return new Response(
        JSON.stringify({ subscribed: false }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: 'active',
      limit: 1
    });

    // Si une souscription active est trouvée sur Stripe mais pas en base, on l'ajoute en base
    if (subscriptions.data.length > 0) {
      const stripeSubscription = subscriptions.data[0];
      const price = stripeSubscription.items.data[0].price;
      
      // Déterminer le type de plan
      let planType = 'standard';
      if (price.id === 'price_basique') planType = 'Basique';
      else if (price.id === 'price_pro') planType = 'Professionnel'; 
      else if (price.id === 'price_enterprise') planType = 'Entreprise';

      // Ajouter la souscription en base
      const { data: newSubscription, error: insertError } = await supabaseClient
        .from('subscriptions')
        .insert({
          user_id: user.id,
          stripe_customer_id: customers.data[0].id,
          stripe_subscription_id: stripeSubscription.id,
          plan_type: planType,
          status: 'active',
          current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Erreur lors de l\'insertion de la souscription:', insertError);
      }

      return new Response(
        JSON.stringify({ 
          subscribed: true,
          subscription: newSubscription || {
            plan_type: planType,
            status: 'active'
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ subscribed: false }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Erreur lors de la vérification de la souscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
