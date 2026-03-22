import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface SubscriptionInfo {
  plan: string;
  status: string;
  expires_at: string | null;
  is_active: boolean;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  subscription: SubscriptionInfo | null;
  isLoading: boolean;
  isSubscribed: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscription = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("subscriptions")
      .select("plan, status, expires_at")
      .eq("user_id", userId)
      .single();

    if (!data) { setSubscription(null); return; }

    const is_active =
      data.status === "active" &&
      (!data.expires_at || new Date(data.expires_at) > new Date());

    setSubscription({ ...data, is_active });
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchSubscription(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchSubscription(session.user.id);
        } else {
          setSubscription(null);
        }
        setIsLoading(false);
      }
    );
    return () => authSub.unsubscribe();
  }, [fetchSubscription]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSubscription(null);
  };

  const refreshSubscription = async () => {
    if (user) await fetchSubscription(user.id);
  };

  return (
    <AuthContext.Provider value={{
      user, session, subscription, isLoading,
      isSubscribed: subscription?.is_active ?? false,
      signIn, signUp, signOut, refreshSubscription,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
