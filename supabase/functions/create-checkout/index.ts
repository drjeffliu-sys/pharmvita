import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.11.0?target=deno&no-check";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const PLANS = {
  monthly:    { name: "衝刺包 - 月訂閱",  price_id: Deno.env.get("STRIPE_PRICE_MONTHLY"),    duration_days: 30  },
  semiannual: { name: "主力方案 - 半年期", price_id: Deno.env.get("STRIPE_PRICE_SEMIANNUAL"), duration_days: 183 },
  yearly:     { name: "安心包 - 一年期",  price_id: Deno.env.get("STRIPE_PRICE_YEARLY"),     duration_days: 365 },
} as const;

type PlanId = keyof typeof PLANS;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "未登入" }), {
        status: 401, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error("Auth error:", authError?.message);
      return new Response(JSON.stringify({ error: "驗證失敗" }), {
        status: 401, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const plan_id = body.plan_id as PlanId;
    const plan = PLANS[plan_id];
    if (!plan || !plan.price_id) {
      return new Response(JSON.stringify({ error: "無效方案" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const frontendUrl = Deno.env.get("FRONTEND_URL") ?? "https://pharmvita.vercel.app";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: plan.price_id, quantity: 1 }],
      mode: "payment",
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: { user_id: user.id, plan_id },
      success_url: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/pricing`,
      locale: "zh-TW",
    });

    console.log("Checkout session created:", session.id, "for user:", user.id);

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200, headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("create-checkout error:", err);
    return new Response(JSON.stringify({ error: "建立付款失敗，請稍後再試" }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
