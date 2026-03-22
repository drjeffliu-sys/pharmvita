import { Link, useLocation } from "wouter";
import { Menu, X, Pill, BookOpen, Map, ClipboardCheck, BarChart3, LogIn, Crown, LogOut, User } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/", label: "首頁", icon: Pill },
  { href: "/subjects", label: "科目題庫", icon: BookOpen },
  { href: "/knowledge", label: "知識分類", icon: Map },
  { href: "/mock-exam", label: "模擬考試", icon: ClipboardCheck },
  { href: "/results", label: "學習成果", icon: BarChart3 },
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
                            {isSubscribed ? "✓ 付費會員" : "免費版（每天 5 題詳解）"}
                          </p>
                        </div>
                        {!isSubscribed && (
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
                  <Link href="/auth/login"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted no-underline transition-all">
                    <LogIn className="w-4 h-4" />
                    登入
                  </Link>
                  <Link href="/pricing"
                    className="btn-capsule flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm no-underline">
                    <Crown className="w-4 h-4" />
                    方案
                  </Link>
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
                    <Link href="/auth/login" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground/70 hover:bg-muted no-underline">
                      <LogIn className="w-5 h-5" />登入
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
