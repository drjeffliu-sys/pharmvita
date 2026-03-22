import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { supabase } from "../lib/supabase.js";
import type { AuthRequest } from "../middleware/auth.js";

const router = Router();

// Plan definitions
export const PLANS = {
  monthly: {
    id: "monthly",
    name: "月訂閱",
    price: 199,
    duration_days: 30,
    description: "完整題庫 30 天",
  },
  yearly: {
    id: "yearly",
    name: "年訂閱",
    price: 1499,
    duration_days: 365,
    description: "完整題庫 365 天，省 44%",
  },
} as const;

/** GET /api/subscription/plans — public, return available plans */
router.get("/plans", (_req, res) => {
  return res.json({ plans: Object.values(PLANS) });
});

/** GET /api/subscription/status — requires auth */
router.get("/status", requireAuth, async (req: AuthRequest, res) => {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", req.userId!)
    .single();

  if (error || !data) {
    return res.json({ subscribed: false, subscription: null });
  }

  const isActive =
    data.status === "active" &&
    (!data.expires_at || new Date(data.expires_at) > new Date());

  return res.json({
    subscribed: isActive,
    subscription: {
      plan: data.plan,
      status: data.status,
      expires_at: data.expires_at,
      is_active: isActive,
    },
  });
});

export default router;
