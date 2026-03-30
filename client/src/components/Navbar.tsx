import { FREE_MODE } from '../lib/config';
import { Link, useLocation } from "wouter";
import { Menu, X, Pill, BookOpen, Map, ClipboardCheck, BarChart3, Crown, LogOut, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/", label: "首頁", icon: Pill },
  { href: "/subjects", label: "科目題庫", icon: BookOpen },
  { href: "/knowledge", label: "知識分類", icon: Map },
  { href: "/mock-exam", label: "模擬考試", icon: ClipboardCheck },
  { href: "/results", label: "學習成果", icon: BarChart3 },
  { href: "/blog", label: "備考攻略", icon: BookOpen },
];

export default function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isSubscribed, signOut, isLoading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b-[2.5px] border-foreground">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-9 h-9 rounded-full bg-emerald-600 border-[2.5px] border-foreground flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.9)]">
            <Pill className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold tracking-tight text-foreground">藥命</span>
            <span className="font-display text-[10px] font-medium tracking-widest text-emerald-700 uppercase">PharmVita</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all no-underline ${
                  isActive
                    ? "bg-emerald-600 text-white border-[2px] border-foreground shadow-[2px_2px_0px_rgba(0,0,0,0.9)]"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted"
                }`}>
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right side: Auth + Subscription */}
        <div className="hidden md:flex items-center gap-2">
          {!isLoading && (
            <>
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all border-[2px] ${
                      isSubscribed
                        ? "bg-amber-50 border-amber-300 text-amber-700"
                        : "bg-muted border-foreground/10 text-foreground/70"
                    }`}
                  >
                    {isSubscribed ? <Crown className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    <span className="max-w-[120px] truncate">{user.email?.split("@")[0]}</span>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 bg-card border-[2.5px] border-foreground rounded-lg shadow-[4px_4px_0px_rgba(0,0,0,0.9)] overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-foreground/10">
                          <p className="text-xs text-muted-foreground">登入為</p>
                          <p className="text-sm font-medium truncate">{user.email}</p>
                          <p className={`text-xs mt-0.5 font-medium ${isSubscribed ? "text-amber-600" : "text-muted-foreground"}`}>
                            {!FREE_MODE && (isSubscribed ? "✓ 付費會員" : "免費版（每天 10 題詳解）")}
                          </p>
                        </div>
                        {!isSubscribed && !FREE_MODE && (
                          <Link href="/pricing" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-3 text-sm text-amber-600 font-medium hover:bg-amber-50 no-underline transition-colors">
                            <Crown className="w-4 h-4" />
                            升級付費方案
                          </Link>
                        )}
                        <button onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left">
                          <LogOut className="w-4 h-4" />
                          登出
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleGoogleLogin}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted transition-all">
                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    登入
                  </button>
                  {!FREE_MODE && <Link href="/pricing"
                    className="btn-capsule flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm no-underline">
                    <Crown className="w-4 h-4" />
                    方案
                  </Link>}
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2 rounded-lg hover:bg-muted" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t-[2px] border-foreground bg-background"
          >
            <div className="container py-3 space-y-1">
              {navItems.map((item) => {
                const isActive = location === item.href;
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium no-underline ${
                      isActive ? "bg-emerald-600 text-white" : "text-foreground/70 hover:bg-muted"
                    }`}>
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="border-t border-foreground/10 pt-2 mt-2">
                {user ? (
                  <>
                    <div className="px-4 py-2 text-xs text-muted-foreground">{user.email}</div>
                    {!isSubscribed && (
                      <Link href="/pricing" onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-amber-600 hover:bg-amber-50 no-underline">
                        <Crown className="w-5 h-5" />升級付費方案
                      </Link>
                    )}
                    <button onClick={() => { handleSignOut(); setMobileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted text-left">
                      <LogOut className="w-5 h-5" />登出
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { handleGoogleLogin(); setMobileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground/70 hover:bg-muted text-left">
                      <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                      Google 登入
                    </button>
                    <Link href="/pricing" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-emerald-700 hover:bg-emerald-50 no-underline">
                      <Crown className="w-5 h-5" />查看付費方案
                    </Link>
                    <Link href="/pricing" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-emerald-700 hover:bg-emerald-50 no-underline">
                      <Crown className="w-5 h-5" />查看付費方案
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
