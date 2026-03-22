import { Link } from "wouter";
import { Pill, ArrowLeft, Stethoscope } from "lucide-react";
import EcgLine from "@/components/EcgLine";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal Navbar */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b-[2.5px] border-foreground">
        <div className="container flex items-center h-16">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-9 h-9 rounded-full bg-emerald-600 border-[2.5px] border-foreground flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.9)]">
              <Pill className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg font-bold tracking-tight text-foreground">藥命</span>
              <span className="font-display text-[10px] font-medium tracking-widest text-emerald-700 uppercase">PharmVita</span>
            </div>
          </Link>
        </div>
      </nav>

      {/* 404 Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          <div className="card-brutal bg-card rounded-lg p-10 mb-6 inline-block">
            <div className="w-20 h-20 rounded-full bg-red-50 border-[2.5px] border-foreground shadow-[4px_4px_0px_rgba(0,0,0,0.9)] flex items-center justify-center mx-auto mb-6">
              <Stethoscope className="w-10 h-10 text-red-500" />
            </div>
            <div className="font-display text-8xl font-black text-foreground leading-none mb-2">
              404
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-3">
              頁面不存在
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              你要找的頁面可能已被移除，<br />
              或是網址輸入有誤。
            </p>
            <Link
              href="/"
              className="btn-capsule inline-flex items-center gap-2 px-7 py-3 bg-emerald-600 text-white text-sm no-underline"
            >
              <ArrowLeft className="w-4 h-4" />
              回到首頁
            </Link>
          </div>
          <EcgLine className="opacity-20" />
        </div>
      </div>
    </div>
  );
}
