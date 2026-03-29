import { FREE_MODE } from '../lib/config';
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { FREE_MODE } from '../lib/config';
import { useAuth } from "@/contexts/AuthContext";
import { FREE_MODE } from '../lib/config';
import { api } from "@/lib/api";

export const FREE_DAILY_LIMIT = 10;

interface ExplanationLimitContextValue {
  usedToday: number;
  canViewExplanation: boolean;
  remaining: number;
  recordView: () => Promise<boolean>;
  isLoading: boolean;
}

const ExplanationLimitContext = createContext<ExplanationLimitContextValue>({
  usedToday: 0,
  canViewExplanation: true,
  remaining: FREE_DAILY_LIMIT,
  recordView: async () => true,
  isLoading: false,
});

export function ExplanationLimitProvider({ children }: { children: React.ReactNode }) {
  const { user, isSubscribed } = useAuth();
  const [usedToday, setUsedToday] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // 每次 user 變更時從 DB 讀取今日用量
  useEffect(() => {
    if (!user) { setUsedToday(0); setInitialized(true); return; }
    if (isSubscribed) { setInitialized(true); return; }

    api.getTodayExplanationUsage()
      .then((count) => { setUsedToday(count); setInitialized(true); })
      .catch(() => setInitialized(true));
  }, [user, isSubscribed]);

  const canViewExplanation = FREE_MODE ? true : (isSubscribed || !initialized || usedToday < FREE_DAILY_LIMIT);
  const remaining = (FREE_MODE || isSubscribed) ? Infinity : Math.max(0, FREE_DAILY_LIMIT - usedToday);

  const recordView = useCallback(async (): Promise<boolean> => {
    if (isSubscribed || !user) return true;
    if (usedToday >= FREE_DAILY_LIMIT) return false;

    setIsLoading(true);
    try {
      const newCount = await api.incrementExplanationUsage();
      setUsedToday(newCount);
      return newCount <= FREE_DAILY_LIMIT;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, isSubscribed, usedToday]);

  return (
    <ExplanationLimitContext.Provider value={{
      usedToday, canViewExplanation, remaining, recordView, isLoading,
    }}>
      {children}
    </ExplanationLimitContext.Provider>
  );
}

export function useExplanationLimit() {
  return useContext(ExplanationLimitContext);
}
