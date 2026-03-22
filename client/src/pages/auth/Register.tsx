import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Pill, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Register() {
  const [, navigate] = useLocation();
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("密碼與確認密碼不一致"); return; }
    if (password.length < 8) { setError("密碼至少需要 8 個字元"); return; }
    setLoading(true);
    try {
      await signUp(email, password);
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "註冊失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center card-brutal bg-card rounded-lg p-10">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-[2.5px] border-foreground shadow-[3px_3px_0px_rgba(0,0,0,0.9)] flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">驗證信已寄出</h2>
          <p className="text-muted-foreground text-sm mb-6">
            請前往 <strong>{email}</strong> 點擊驗證連結以完成註冊
          </p>
          <Link href="/auth/login"
            className="btn-capsule inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white text-sm no-underline">
            前往登入
          </Link>
        </motion.div>
      </div>
    );
  }

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
          <h1 className="font-display text-2xl font-bold mb-2">建立帳號</h1>
          <p className="text-sm text-muted-foreground mb-6">免費加入，每天 5 題詳解無限期使用</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">電子郵件</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-lg border-[2px] border-foreground/20 bg-background focus:outline-none focus:border-emerald-500 transition-colors text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">密碼（至少 8 字元）</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-10 rounded-lg border-[2px] border-foreground/20 bg-background focus:outline-none focus:border-emerald-500 transition-colors text-sm" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">確認密碼</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border-[2px] border-foreground/20 bg-background focus:outline-none focus:border-emerald-500 transition-colors text-sm" />
            </div>
            <button type="submit" disabled={loading}
              className="btn-capsule w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 text-white text-sm disabled:opacity-50 mt-2">
              {loading ? "建立中..." : "建立帳號"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            已有帳號？{" "}
            <Link href="/auth/login" className="text-emerald-600 hover:underline no-underline font-medium">登入</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
