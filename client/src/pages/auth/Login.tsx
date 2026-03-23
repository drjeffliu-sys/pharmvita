import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Pill, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [, navigate] = useLocation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "登入失敗，請確認帳號密碼");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google 登入失敗");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2.5 no-underline mb-8">
          <div className="w-10 h-10 rounded-full bg-emerald-600 border-[2.5px] border-foreground flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.9)]">
            <Pill className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-xl font-bold">藥命</span>
            <span className="font-display text-[10px] font-medium tracking-widest text-emerald-700 uppercase">PharmVita</span>
          </div>
        </Link>

        <div className="card-brutal bg-card rounded-lg p-8">
          <h1 className="font-display text-2xl font-bold mb-2">登入帳號</h1>
          <p className="text-sm text-muted-foreground mb-6">登入後同步學習進度，免費版每天 5 題詳解</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
          )}

          {/* Google 登入 */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border-[2px] border-foreground/20 bg-white hover:bg-gray-50 transition-colors text-sm font-medium mb-4 disabled:opacity-50"
          >
            {googleLoading ? (
              <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {googleLoading ? "連接中..." : "使用 Google 帳號登入"}
          </button>

          {/* 分隔線 */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-foreground/10" />
            <span className="text-xs text-muted-foreground">或用電子郵件登入</span>
            <div className="flex-1 h-px bg-foreground/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">電子郵件</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-lg border-[2px] border-foreground/20 bg-background focus:outline-none focus:border-emerald-500 transition-colors text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">密碼</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-10 rounded-lg border-[2px] border-foreground/20 bg-background focus:outline-none focus:border-emerald-500 transition-colors text-sm" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading || googleLoading}
              className="btn-capsule w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 text-white text-sm disabled:opacity-50">
              {loading ? "登入中..." : "登入"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            還沒有帳號？{" "}
            <Link href="/auth/register" className="text-emerald-600 hover:underline no-underline font-medium">立即註冊</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
