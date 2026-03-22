import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Pill, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [, navigate] = useLocation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
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
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">電子郵件</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-lg border-[2px] border-foreground/20 bg-background focus:outline-none focus:border-emerald-500 transition-colors text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">密碼</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-10 rounded-lg border-[2px] border-foreground/20 bg-background focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-capsule w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 text-white text-sm disabled:opacity-50 mt-2"
            >
              {loading ? "登入中..." : "登入"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            還沒有帳號？{" "}
            <Link href="/auth/register" className="text-emerald-600 hover:underline no-underline font-medium">
              立即註冊
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
