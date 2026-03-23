import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, Zap, Flame, Shield, Star, ArrowRight, Crown, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";

type PaidPlanId = "monthly" | "semiannual" | "yearly";

interface Plan {
  id: string;
  name: string;
  tagline: string;
  price: number;
  monthlyEquiv: number | null;
  period: string;
  icon: React.ReactNode;
  accentColor: string;
  bgColor: string;
  features: string[];
  limits?: string[];
  cta: string;
  badge?: string;
  badgeColor?: string;
  isHighlight?: boolean;
  isFree?: boolean;
  psychNote: string;
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "基礎體驗",
    tagline: "免費開始",
    price: 0,
    monthlyEquiv: 0,
    period: "",
    icon: <Zap className="w-5 h-5" />,
    accentColor: "#6b7280",
    bgColor: "#f9fafb",
    features: [
      "完整 5,363 題題庫瀏覽",
      "查看所有正確答案",
      "每日 5 次大補帖詳解解鎖",
      "模擬考試功能",
      "學習進度本機儲存",
    ],
    limits: ["每日詳解上限 5 次"],
    cta: "免費開始刷題",
    isFree: true,
    psychNote: "",
  },
  {
    id: "monthly",
    name: "衝刺包",
    tagline: "月訂閱",
    price: 599,
    monthlyEquiv: 599,
    period: "/ 月",
    icon: <Flame className="w-5 h-5" />,
    accentColor: "#dc2626",
    bgColor: "#fef2f2",
    features: [
      "無限詳解解鎖",
      "學習進度雲端同步",
      "書籤跨裝置同步",
      "109–114 年全屆篩選",
    ],
    cta: "立即訂閱",
    psychNote: "考前急用首選",
  },
  {
    id: "semiannual",
    name: "主力方案",
    tagline: "半年期",
    price: 2394,
    monthlyEquiv: 399,
    period: "/ 半年",
    icon: <Star className="w-5 h-5" />,
    accentColor: "#059669",
    bgColor: "#f0fdf4",
    features: [
      "無限詳解解鎖",
      "學習進度雲端同步",
      "書籤跨裝置同步",
      "109–114 年全屆篩選",
      "完美契合半年一考週期",
    ],
    cta: "選擇主力方案",
    badge: "最多人選擇",
    badgeColor: "#059669",
    isHighlight: true,
    psychNote: "比月訂省 $200/月",
  },
  {
    id: "yearly",
    name: "安心包",
    tagline: "一年期",
    price: 3588,
    monthlyEquiv: 299,
    period: "/ 年",
    icon: <Shield className="w-5 h-5" />,
    accentColor: "#7c3aed",
    bgColor: "#faf5ff",
    features: [
      "無限詳解解鎖",
      "學習進度雲端同步",
      "書籤跨裝置同步",
      "109–114 年全屆篩選",
      "最長備考週期保障",
    ],
    cta: "選擇安心包",
    badge: "月費最低",
    badgeColor: "#7c3aed",
    psychNote: "比月訂省 $300/月",
  },
];

const FAQ = [
  { q: "半年期方案對應哪個考期？", a: "藥師國考每年 2 月和 7 月各一次。半年期方案（183 天）完美涵蓋一個完整考試週期，從報名備考到放榜。" },
  { q: "付款後多久生效？", a: "透過 Stripe 付款成功後，訂閱立即生效，無需等待審核。" },
  { q: "支援哪些付款方式？", a: "支援信用卡（Visa / Mastercard）、Apple Pay、Google Pay，全程 SSL 加密，我們不儲存卡片資訊。" },
  { q: "到期後資料會消失嗎？", a: "不會。到期後自動降回免費版，雲端進度保留 90 天。重新訂閱後立即恢復所有記錄。" },
  { q: "可以退款嗎？", a: "付款後 7 日內如有問題可聯繫客服協助處理。" },
];

export default function Pricing() {
  const { user, isSubscribed, subscription } = useAuth();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSubscribe = async (planId: PaidPlanId) => {
    if (!user) { navigate("/auth/login"); return; }
    setError("");
    setLoading(planId);
    try {
      const { url } = await api.createCheckout(planId);
      window.location.href = url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "建立付款連結失敗，請稍後再試");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="container py-14 text-center max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold tracking-widest text-emerald-600 uppercase mb-3">選擇方案</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4">
            一次投資，通過國考
          </h1>
          <p className="text-muted-foreground text-lg">
            5,363 題 × 12 屆 × 完整 AI 詳解。<br className="hidden md:block" />
            半年方案月費 $399，比一本參考書還划算。
          </p>
        </motion.div>

        {/* Current subscription banner */}
        {isSubscribed && subscription && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-full text-sm text-emerald-700 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            目前方案：{
              subscription.plan === "semiannual" ? "主力方案（半年期）" :
              subscription.plan === "yearly" ? "安心包（一年期）" : "衝刺包（月訂閱）"
            }
            {subscription.expires_at && (
              <span className="text-emerald-600 font-normal">
                · 到期 {new Date(subscription.expires_at).toLocaleDateString("zh-TW")}
              </span>
            )}
          </motion.div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="container max-w-md mx-auto mb-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 text-center">{error}</div>
        </div>
      )}

      {/* Plan Cards */}
      <div className="container pb-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map((plan, i) => {
            const isCurrentPlan = isSubscribed && subscription?.plan === plan.id;
            const isPaidPlan = !plan.isFree;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`relative flex flex-col rounded-lg border-[2.5px] transition-all ${
                  plan.isHighlight
                    ? "border-emerald-500 shadow-[4px_4px_0px_rgba(5,150,105,0.4)]"
                    : "border-foreground shadow-[4px_4px_0px_rgba(0,0,0,0.9)]"
                } bg-card`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold text-white border-2 border-white shadow-sm whitespace-nowrap"
                    style={{ backgroundColor: plan.badgeColor }}>
                    {plan.badge}
                  </div>
                )}

                <div className="p-5 flex flex-col flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center border-[2px] border-foreground shadow-[2px_2px_0px_rgba(0,0,0,0.9)]"
                      style={{ backgroundColor: plan.accentColor, color: "white" }}>
                      {plan.icon}
                    </div>
                    <div>
                      <p className="font-display text-base font-bold leading-tight">{plan.name}</p>
                      <p className="text-xs text-muted-foreground">{plan.tagline}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-end gap-1">
                      <span className="font-display text-3xl font-black">
                        ${plan.price.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground text-sm mb-0.5">{plan.period}</span>
                    </div>
                    {plan.monthlyEquiv !== null && plan.monthlyEquiv > 0 && (
                      <p className="text-xs mt-1" style={{ color: plan.accentColor }}>
                        ≈ <strong>${plan.monthlyEquiv}</strong> / 月
                        {plan.psychNote && (
                          <span className="text-muted-foreground font-normal ml-1">· {plan.psychNote}</span>
                        )}
                      </p>
                    )}
                    {plan.isFree && (
                      <p className="text-xs text-muted-foreground mt-1">永久免費，無需信用卡</p>
                    )}
                  </div>

                  {/* Visual savings bar (paid plans only) */}
                  {isPaidPlan && plan.monthlyEquiv !== null && (
                    <div className="mb-4">
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                        <span>vs 月訂閱 $599</span>
                        <span className="font-bold" style={{ color: plan.accentColor }}>
                          省 {Math.round((1 - plan.monthlyEquiv / 599) * 100)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{
                            width: `${100 - Math.round((1 - plan.monthlyEquiv / 599) * 100)}%`,
                            backgroundColor: plan.accentColor,
                            opacity: 0.7,
                          }} />
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  <ul className="space-y-2 mb-5 flex-1">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: plan.accentColor }} />
                        <span>{f}</span>
                      </li>
                    ))}
                    {plan.limits?.map((f, j) => (
                      <li key={`x-${j}`} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <X className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-400" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {isCurrentPlan ? (
                    <div className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium border-[2px] border-emerald-200">
                      <CheckCircle2 className="w-4 h-4" />
                      目前方案
                    </div>
                  ) : plan.isFree ? (
                    <Link href="/subjects"
                      className="btn-capsule w-full flex items-center justify-center gap-1.5 py-3 bg-muted text-foreground text-sm no-underline">
                      {plan.cta}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <div>
                      {isSubscribed && !isCurrentPlan && !plan.isFree && (
                        <p className="text-[10px] text-center text-muted-foreground mb-2">
                          升級後到期日將重新計算
                        </p>
                      )}
                      <button
                        onClick={() => handleSubscribe(plan.id as PaidPlanId)}
                        disabled={loading !== null}
                        className="btn-capsule w-full flex items-center justify-center gap-1.5 py-3 text-white text-sm disabled:opacity-50"
                        style={{ backgroundColor: loading === plan.id ? "#9ca3af" : plan.accentColor }}
                      >
                        {loading === plan.id ? (
                          <span className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            處理中...
                          </span>
                        ) : (
                          <>
                            {isSubscribed ? "升級此方案" : plan.cta}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison highlight */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="mt-8 p-5 bg-emerald-50 border-[2px] border-emerald-200 rounded-lg max-w-2xl mx-auto text-center">
          <p className="text-sm text-emerald-800">
            <Crown className="w-4 h-4 inline-block mr-1.5 mb-0.5 text-emerald-600" />
            選擇<strong>主力方案（半年期）</strong>，相比月訂一個考試週期可省下 <strong>$1,200</strong>
            ——足以買 4 本參考書。
          </p>
        </motion.div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="font-display text-xl font-bold text-center mb-8">常見問題</h2>
          <div className="space-y-3">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="card-brutal bg-card rounded-lg overflow-hidden group">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-medium list-none">
                  {q}
                  <span className="text-muted-foreground text-lg leading-none ml-4 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-5 pb-4 text-sm text-muted-foreground border-t border-foreground/10 pt-3">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-10">
          付款由 Stripe 安全處理 · 支援信用卡、Apple Pay、Google Pay · SSL 全程加密
        </p>
      </div>
    </div>
  );
}
