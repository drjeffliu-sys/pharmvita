import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

export const FREE_DAILY_LIMIT = 10;

export function useExplanationLimit() {
  const { user, isSubscribed } = useAuth();
  const [usedToday, setUsedToday] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user || isSubscribed) return;
    api.getTodayExplanationUsage().then(setUsedToday).catch(() => {});
  }, [user, isSubscribed]);

  const canViewExplanation = isSubscribed || usedToday < FREE_DAILY_LIMIT;
  const remaining = isSubscribed ? Infinity : Math.max(0, FREE_DAILY_LIMIT - usedToday);

  const recordView = useCallback(async () => {
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

  return { canViewExplanation, remaining, usedToday, recordView, isLoading };
}
