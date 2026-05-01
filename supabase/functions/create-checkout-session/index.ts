// supabase/functions/create-checkout-session/index.ts
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const PRICE_IDS = {
  monthly: "price_1TRXvsHh8Kb7lzAUwgROa0he",
  yearly:  "price_1TRXwrHh8Kb7lzAUUvUkRLZo",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Not authenticated");

    const { plan } = await req.json();
    const priceId = PRICE_IDS[plan as keyof typeof PRICE_IDS];
    if (!priceId) throw new Error("Invalid plan");

    const appUrl = "https://app.noxreach.com";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}?upgraded=true`,
      cancel_url: `${appUrl}?upgrade=cancelled`,
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: { user_id: user.id, plan },
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true },
      subscription_data: {
        metadata: { user_id: user.id, plan },
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
