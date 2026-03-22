import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { supabase } from "../lib/supabase.js";
import type { AuthRequest } from "../middleware/auth.js";

const router = Router();

/** GET /api/auth/me — return user info + subscription status */
router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;

  // Fetch subscription
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status, expires_at, created_at")
    .eq("user_id", userId)
    .single();

  const isSubscribed =
    sub?.status === "active" &&
    (!sub.expires_at || new Date(sub.expires_at) > new Date());

  return res.json({
    id: userId,
    email: req.userEmail,
    subscription: sub
      ? {
          plan: sub.plan,
          status: sub.status,
          expires_at: sub.expires_at,
          is_active: isSubscribed,
        }
      : null,
  });
});

/** DELETE /api/auth/account — delete account */
router.delete("/account", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;

  // Delete user data
  await supabase.from("progress").delete().eq("user_id", userId);
  await supabase.from("subscriptions").delete().eq("user_id", userId);
  await supabase.auth.admin.deleteUser(userId);

  return res.json({ message: "帳號已刪除" });
});

export default router;
