import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const PLAN_DAYS: Record<string, number> = {
  monthly:    30,
  semiannual: 183,
  yearly:     365,
};

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, Deno.env.get("STRIPE_WEBHOOK_SECRET")!);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== "paid") return new Response(JSON.stringify({ received: true }), { status: 200 });

    const userId = session.metadata?.user_id;
    const planId = session.metadata?.plan_id;
    if (!userId || !planId) { console.error("Missing metadata", session.id); return new Response(JSON.stringify({ received: true }), { status: 200 }); }

    const days = PLAN_DAYS[planId] ?? 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    await supabase.from("subscriptions").upsert({
      user_id: userId,
      stripe_customer_id: session.customer as string,
      plan: planId,
      status: "active",
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    await supabase.from("orders").upsert({
      id: session.id,
      user_id: userId,
      plan: planId,
      amount: session.amount_total ?? 0,
      currency: session.currency ?? "twd",
      status: "paid",
      stripe_payment_intent_id: session.payment_intent as string,
    });

    console.log(`✓ ${planId} activated for ${userId}, expires ${expiresAt.toISOString()}`);
  }

  return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
});
