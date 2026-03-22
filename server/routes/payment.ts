import { Router } from "express";
import crypto from "crypto";
import { requireAuth } from "../middleware/auth.js";
import { supabase } from "../lib/supabase.js";
import type { AuthRequest } from "../middleware/auth.js";
import { PLANS } from "./subscription.js";

const router = Router();

const ECPAY_MERCHANT_ID = process.env.ECPAY_MERCHANT_ID!;
const ECPAY_HASH_KEY = process.env.ECPAY_HASH_KEY!;
const ECPAY_HASH_IV = process.env.ECPAY_HASH_IV!;
const ECPAY_API_URL =
  process.env.NODE_ENV === "production"
    ? "https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5"
    : "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// ECPay SHA256 checksum
function generateCheckMacValue(params: Record<string, string>): string {
  const sorted = Object.keys(params)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map((k) => `${k}=${params[k]}`)
    .join("&");

  const raw = `HashKey=${ECPAY_HASH_KEY}&${sorted}&HashIV=${ECPAY_HASH_IV}`;
  const encoded = encodeURIComponent(raw)
    .toLowerCase()
    .replace(/%20/g, "+")
    .replace(/%21/g, "!")
    .replace(/%28/g, "(")
    .replace(/%29/g, ")")
    .replace(/%2a/g, "*")
    .replace(/%2d/g, "-")
    .replace(/%2e/g, ".")
    .replace(/%5f/g, "_");

  return crypto.createHash("sha256").update(encoded).digest("hex").toUpperCase();
}

/** POST /api/payment/create — create ECPay order and return HTML form */
router.post("/create", requireAuth, async (req: AuthRequest, res) => {
  const { plan_id } = req.body as { plan_id: "monthly" | "yearly" };
  const plan = PLANS[plan_id];
  if (!plan) return res.status(400).json({ error: "無效的方案" });

  const orderId = `PV${Date.now()}`;
  const now = new Date();
  const merchantTradeDate = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

  // Save order to DB
  await supabase.from("orders").insert({
    id: orderId,
    user_id: req.userId,
    plan_id,
    amount: plan.price,
    status: "pending",
    created_at: new Date().toISOString(),
  });

  const params: Record<string, string> = {
    MerchantID: ECPAY_MERCHANT_ID,
    MerchantTradeNo: orderId,
    MerchantTradeDate: merchantTradeDate,
    PaymentType: "aio",
    TotalAmount: String(plan.price),
    TradeDesc: encodeURIComponent("藥命PharmVita訂閱"),
    ItemName: plan.name,
    ReturnURL: `${BACKEND_URL}/api/payment/webhook`,
    OrderResultURL: `${FRONTEND_URL}/payment/result`,
    ClientBackURL: `${FRONTEND_URL}/pricing`,
    ChoosePayment: "Credit", // Credit card + convenience store
    EncryptType: "1",
  };

  params.CheckMacValue = generateCheckMacValue(params);

  // Return HTML auto-submit form (standard ECPay pattern)
  const formFields = Object.entries(params)
    .map(([k, v]) => `<input type="hidden" name="${k}" value="${v}">`)
    .join("");

  const html = `<!DOCTYPE html><html><body>
<form id="ecpay" method="POST" action="${ECPAY_API_URL}">${formFields}</form>
<script>document.getElementById('ecpay').submit();</script>
</body></html>`;

  return res.send(html);
});

/** POST /api/payment/webhook — ECPay payment result callback */
router.post("/webhook", async (req, res) => {
  const body = req.is("application/x-www-form-urlencoded")
    ? req.body
    : Object.fromEntries(new URLSearchParams(req.body.toString()));

  const { CheckMacValue, ...params } = body;

  // Verify checksum
  const computed = generateCheckMacValue(params);
  if (computed !== CheckMacValue) {
    console.error("ECPay webhook checksum mismatch");
    return res.send("0|ErrorMessage");
  }

  const {
    MerchantTradeNo: orderId,
    RtnCode,
    TradeNo,
  } = params;

  if (RtnCode !== "1") {
    // Payment failed — update order status
    await supabase
      .from("orders")
      .update({ status: "failed", ecpay_trade_no: TradeNo })
      .eq("id", orderId);
    return res.send("1|OK");
  }

  // Payment success — fetch order, activate subscription
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (!order) return res.send("0|OrderNotFound");

  const plan = PLANS[order.plan_id as "monthly" | "yearly"];
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + plan.duration_days);

  // Upsert subscription
  await supabase.from("subscriptions").upsert(
    {
      user_id: order.user_id,
      plan: order.plan_id,
      status: "active",
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  // Mark order paid
  await supabase
    .from("orders")
    .update({ status: "paid", ecpay_trade_no: TradeNo })
    .eq("id", orderId);

  console.log(`Order ${orderId} paid, subscription activated for user ${order.user_id}`);
  return res.send("1|OK");
});

/** GET /api/payment/orders — user's order history */
router.get("/orders", requireAuth, async (req: AuthRequest, res) => {
  const { data } = await supabase
    .from("orders")
    .select("id, plan_id, amount, status, created_at")
    .eq("user_id", req.userId!)
    .order("created_at", { ascending: false })
    .limit(20);

  return res.json({ orders: data || [] });
});

export default router;
