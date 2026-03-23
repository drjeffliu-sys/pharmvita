import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;

const PLANS: Record<string, { name: string; price_id: string; duration_days: number }> = {
  monthly:    { name: "衝刺包 - 月訂閱",  price_id: Deno.env.get("STRIPE_PRICE_MONTHLY")!,    duration_days: 30  },
  semiannual: { name: "主力方案 - 半年期", price_id: Deno.env.get("STRIPE_PRICE_SEMIANNUAL")!, duration_days: 183 },
  yearly:     { name: "安心包 - 一年期",  price_id: Deno.env.get("STRIPE_PRICE_YEARLY")!,     duration_days: 365 },
};

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function stripeRequest(path: string, params: Record<string, string>) {
  const body = new URLSearchParams(params).toString();
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  return res.json();
}

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
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error("Auth error:", authError?.message, "token:", token.substring(0, 20));
      return new Response(JSON.stringify({ error: "驗證失敗" }), {
        status: 401, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const { plan_id } = await req.json();
    const plan = PLANS[plan_id];
    if (!plan || !plan.price_id) {
      return new Response(JSON.stringify({ error: "無效方案" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const frontendUrl = Deno.env.get("FRONTEND_URL") ?? "https://pharmvita.vercel.app";

    // 直接用 fetch 呼叫 Stripe REST API，不用 SDK
    const session = await stripeRequest("/checkout/sessions", {
      "payment_method_types[0]": "card",
      "line_items[0][price]": plan.price_id,
      "line_items[0][quantity]": "1",
      "mode": "payment",
      "customer_email": user.email ?? "",
      "client_reference_id": user.id,
      "metadata[user_id]": user.id,
      "metadata[plan_id]": plan_id,
      "success_url": `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      "cancel_url": `${frontendUrl}/pricing`,
      "locale": "zh-TW",
    });

    if (session.error) {
      console.error("Stripe error:", session.error);
      return new Response(JSON.stringify({ error: session.error.message }), {
        status: 500, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    console.log("Session created:", session.id, "user:", user.id);
    return new Response(JSON.stringify({ url: session.url }), {
      status: 200, headers: { ...cors, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "建立付款失敗，請稍後再試" }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
