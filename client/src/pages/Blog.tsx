import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Tag } from "lucide-react";
import Navbar from "@/components/Navbar";
import { BLOG_POSTS } from "@/data/blog-posts";

export default function Blog() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-12 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-xs font-bold tracking-widest text-emerald-600 uppercase mb-2">備考知識庫</p>
          <h1 className="font-display text-4xl font-bold mb-3">藥師國考攻略</h1>
          <p className="text-muted-foreground">科學化備考策略、考題趨勢分析、高效刷題方法論</p>
        </motion.div>

        <div className="space-y-5">
          {BLOG_POSTS.map((post, i) => (
            <motion.div key={post.slug}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Link href={`/blog/${post.slug}`} className="no-underline block">
                <div className="card-brutal bg-card rounded-lg p-6 hover:shadow-[6px_6px_0px_rgba(0,0,0,0.9)] transition-all group">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    {post.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                        <Tag className="w-2.5 h-2.5" />{tag}
                      </span>
                    ))}
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground ml-auto">
                      <Clock className="w-3 h-3" />{post.readingTime} 分鐘閱讀
                    </span>
                  </div>
                  <h2 className="font-display text-lg font-bold leading-snug mb-2 group-hover:text-emerald-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{post.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.publishedAt).toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
                      閱讀全文 <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
