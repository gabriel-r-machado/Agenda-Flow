import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Mapping of product IDs to subscription tiers
const PRODUCT_TIERS: Record<string, string> = {
  "prod_T2ODB3jKJSYfRe": "professional",
  "prod_T2OCpqWiEzCmsE": "basic",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, returning unsubscribed state");
      
      // Update profile to reflect no subscription
      await supabaseClient
        .from('profiles')
        .update({ subscription_status: 'inactive' })
        .eq('user_id', user.id);
      
      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription_tier: null,
        subscription_end: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    logStep("Subscriptions query complete", { count: subscriptions.data.length });
    
    let hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier: string | null = null;
    let subscriptionEnd: string | null = null;
    let cancelAtPeriodEnd = false;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      
      // Check if subscription is set to cancel at period end
      cancelAtPeriodEnd = subscription.cancel_at_period_end === true;
      
      logStep("Processing subscription", { 
        subscriptionId: subscription.id,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: cancelAtPeriodEnd,
        status: subscription.status
      });
      
      // Safely convert Unix timestamp to ISO string
      if (subscription.current_period_end && typeof subscription.current_period_end === 'number') {
        try {
          const endDate = new Date(subscription.current_period_end * 1000);
          if (!isNaN(endDate.getTime())) {
            subscriptionEnd = endDate.toISOString();
          }
        } catch (e) {
          logStep("Error parsing subscription end date", { error: String(e) });
        }
      }
      
      // If cancelled at period end, check if the period has passed
      if (cancelAtPeriodEnd && subscriptionEnd) {
        const endDate = new Date(subscriptionEnd);
        if (endDate < new Date()) {
          // Period has ended, subscription is no longer active
          hasActiveSub = false;
          logStep("Subscription period has ended", { endDate: subscriptionEnd });
        }
      }
      
      logStep("Active subscription found", { 
        subscriptionId: subscription.id, 
        endDate: subscriptionEnd,
        cancelAtPeriodEnd 
      });
      
      // Get product ID from subscription items
      const priceData = subscription.items?.data?.[0]?.price;
      if (priceData?.product) {
        const productId = typeof priceData.product === 'string' ? priceData.product : priceData.product.id;
        subscriptionTier = PRODUCT_TIERS[productId] || null;
        logStep("Determined subscription tier", { productId, subscriptionTier });
      }
      
      // Update profile with subscription status AND subscription_tier
      const subscriptionStatus = cancelAtPeriodEnd ? 'canceling' : 'active';
      await supabaseClient
        .from('profiles')
        .update({ 
          subscription_status: subscriptionStatus,
          subscription_tier: subscriptionTier,
          stripe_customer_id: customerId 
        })
        .eq('user_id', user.id);
    } else {
      logStep("No active subscription found");
      
      // Update profile to reflect inactive subscription and clear tier
      await supabaseClient
        .from('profiles')
        .update({ 
          subscription_status: 'inactive',
          subscription_tier: 'free',
          stripe_customer_id: customerId 
        })
        .eq('user_id', user.id);
    }

    logStep("Returning response", { subscribed: hasActiveSub, subscriptionTier, subscriptionEnd, cancelAtPeriodEnd });

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      cancel_at_period_end: cancelAtPeriodEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
