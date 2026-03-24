import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const PLANS: Record<string, { price_id: string }> = {
  monthly:    { price_id: Deno.env.get("STRIPE_PRICE_MONTHLY")!    },
  semiannual: { price_id: Deno.env.get("STRIPE_PRICE_SEMIANNUAL")! },
  yearly:     { price_id: Deno.env.get("STRIPE_PRICE_YEARLY")!     },
};
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
async function stripeRequest(path: string, params: Record<string, string>) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  });
  return res.json();
}
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "未登入" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const token = authHeader.slice(7);
    let userId: string, userEmail: string;
    try {
      const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      userId = payload.sub;
      userEmail = payload.email ?? "";
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return new Response(JSON.stringify({ error: "登入已過期" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
      }
      if (!userId || !payload.iss?.includes("supabase")) throw new Error("invalid");
    } catch {
      return new Response(JSON.stringify({ error: "Token 無效" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
    }
    console.log("User:", userId, userEmail);
    const { plan_id } = await req.json();
    const plan = PLANS[plan_id];
    if (!plan?.price_id) {
      return new Response(JSON.stringify({ error: "無效方案" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const frontendUrl = Deno.env.get("FRONTEND_URL") ?? "https://pharmvita.vercel.app";
    const session = await stripeRequest("/checkout/sessions", {
      "payment_method_types[0]": "card",
      "line_items[0][price]": plan.price_id,
      "line_items[0][quantity]": "1",
      "mode": "payment",
      "customer_email": userEmail,
      "client_reference_id": userId,
      "metadata[user_id]": userId,
      "metadata[plan_id]": plan_id,
      "success_url": `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      "cancel_url": `${frontendUrl}/pricing`,
      "locale": "zh-TW",
    });
    if (session.error) {
      console.error("Stripe error:", JSON.stringify(session.error));
      return new Response(JSON.stringify({ error: session.error.message }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
    }
    console.log("Session created:", session.id);
    return new Response(JSON.stringify({ url: session.url }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "建立付款失敗" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
