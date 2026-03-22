import { Router } from "express";
import { requireAuth, requireSubscription } from "../middleware/auth.js";
import { supabase } from "../lib/supabase.js";
import type { AuthRequest } from "../middleware/auth.js";

const router = Router();

/** GET /api/progress — load user's cloud progress */
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const { data, error } = await supabase
    .from("progress")
    .select("data, updated_at")
    .eq("user_id", req.userId!)
    .single();

  if (error || !data) {
    return res.json({ progress: null });
  }

  return res.json({ progress: data.data, updated_at: data.updated_at });
});

/** PUT /api/progress — save user's progress (requires subscription) */
router.put("/", requireAuth, requireSubscription, async (req: AuthRequest, res) => {
  const { progress } = req.body;

  if (!progress || typeof progress !== "object") {
    return res.status(400).json({ error: "無效的進度資料" });
  }

  const { error } = await supabase
    .from("progress")
    .upsert(
      {
        user_id: req.userId!,
        data: progress,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) {
    return res.status(500).json({ error: "儲存失敗，請稍後再試" });
  }

  return res.json({ success: true });
});

/** DELETE /api/progress — reset progress */
router.delete("/", requireAuth, async (req: AuthRequest, res) => {
  await supabase.from("progress").delete().eq("user_id", req.userId!);
  return res.json({ success: true });
});

export default router;
