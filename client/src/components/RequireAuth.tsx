import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Pill, LogIn, Crown } from "lucide-react";
import { Link } from "wouter";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  // 還在載入中，顯示空白避免閃爍
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 未登入，顯示登入提示
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center"
        >
          {/* Logo */}
          <div className="w-16 h-16 rounded-full bg-emerald-600 border-[2.5px] border-foreground shadow-[3px_3px_0px_rgba(0,0,0,0.9)] flex items-center justify-center mx-auto mb-6">
            <Pill className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>

          <h2 className="font-display text-2xl font-bold mb-2">請先登入</h2>
          <p className="text-muted-foreground text-sm mb-8">
            登入後即可免費使用完整題庫<br />每天 5 次大補帖詳解解鎖
          </p>

          <div className="space-y-3">
            <Link
              href={`/auth/login`}
              className="btn-capsule w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 text-white text-sm no-underline"
            >
              <LogIn className="w-4 h-4" />
              登入帳號
            </Link>
            <Link
              href="/auth/register"
              className="btn-capsule w-full flex items-center justify-center gap-2 py-3.5 bg-card text-foreground text-sm no-underline border-[2px] border-foreground/20"
            >
              免費註冊
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            支援 Google 帳號一鍵登入
          </p>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
