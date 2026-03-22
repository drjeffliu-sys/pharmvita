import type { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase.js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

/** Verify Supabase JWT token and attach userId to request */
export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "未登入，請先登入帳號" });
  }

  const token = authHeader.slice(7);
  // Use anon client to verify user token
  const client = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error } = await client.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: "登入憑證無效或已過期，請重新登入" });
  }

  req.userId = user.id;
  req.userEmail = user.email;
  next();
}

/** Require valid active subscription */
export async function requireSubscription(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.userId) {
    return res.status(401).json({ error: "未登入" });
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("status, expires_at, plan")
    .eq("user_id", req.userId)
    .single();

  if (error || !data) {
    return res.status(403).json({
      error: "尚未訂閱，請購買方案後使用完整功能",
      code: "NO_SUBSCRIPTION",
    });
  }

  const isActive =
    data.status === "active" &&
    (!data.expires_at || new Date(data.expires_at) > new Date());

  if (!isActive) {
    return res.status(403).json({
      error: "訂閱已過期，請續訂後繼續使用",
      code: "SUBSCRIPTION_EXPIRED",
      expires_at: data.expires_at,
    });
  }

  next();
}
