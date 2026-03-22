import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

export default function PaymentSuccess() {
  const { refreshSubscription } = useAuth();
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Refresh subscription status after payment
    const timer = setTimeout(async () => {
      await refreshSubscription();
      setDone(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [refreshSubscription]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-20 flex flex-col items-center text-center max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-24 h-24 rounded-full bg-emerald-50 border-[3px] border-foreground shadow-[4px_4px_0px_rgba(0,0,0,0.9)] flex items-center justify-center mb-8"
        >
          <CheckCircle2 className="w-12 h-12 text-emerald-600" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="font-display text-3xl font-bold mb-3">付款成功！</h1>
          <p className="text-muted-foreground mb-2">感謝你訂閱藥命 PharmVita</p>
          <p className="text-sm text-muted-foreground mb-8">
            {done ? "訂閱已啟用，現在可以無限查看詳解了 🎉" : "正在啟用訂閱..."}
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/subjects"
              className="btn-capsule flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 text-white text-sm no-underline">
              <BookOpen className="w-4 h-4" />
              開始刷題
            </Link>
            <Link href="/results"
              className="btn-capsule flex items-center justify-center gap-2 px-8 py-3 bg-card text-foreground text-sm no-underline">
              查看學習成果
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
