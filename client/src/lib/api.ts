import { supabase } from "./supabase";

// 直接 hardcode Supabase URL 和 anon key 作為 fallback
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://adehvxbiaqtjsmvqavgt.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZWh2eGJpYXF0anNtdnFhdmd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMDQxMjksImV4cCI6MjA1Nzc4MDEyOX0.T865HMiC1IHigInwgrh4BX3iXpoy_e7gCD-p1yTAqlU";
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

async function callFunction<T>(name: string, body?: unknown): Promise<T> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();


  if (!session?.access_token) {
    throw new Error("未登入，請重新登入");
  }

  const url = `${FUNCTIONS_URL}/${name}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${session.access_token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });


  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "網路錯誤" }));
    throw Object.assign(new Error(err.error || "Request failed"), { status: res.status });
  }
  return res.json();
}

export const api = {
  createCheckout: (plan_id: "monthly" | "semiannual" | "yearly") =>
    callFunction<{ url: string }>("create-checkout", { plan_id }),

  loadProgress: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase
      .from("progress").select("data, updated_at").eq("user_id", user.id).single();
    return data;
  },

  saveProgress: async (progress: unknown) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("progress").upsert(
      { user_id: user.id, data: progress, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
  },

  getTodayExplanationUsage: async (): Promise<number> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("daily_explanation_usage")
      .select("count").eq("user_id", user.id).eq("used_date", today).single();
    return data?.count ?? 0;
  },

  incrementExplanationUsage: async (): Promise<number> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;
    const { data } = await supabase.rpc("increment_explanation_usage", { p_user_id: user.id });
    return data ?? 0;
  },

  getOrders: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase
      .from("orders").select("id, plan, amount, status, created_at")
      .eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
    return data ?? [];
  },
};
