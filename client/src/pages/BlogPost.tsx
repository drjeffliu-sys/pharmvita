import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Tag, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import { BLOG_POSTS } from "@/data/blog-posts";

interface Props { slug: string }

function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(<h2 key={key++} className="font-display text-xl font-bold mt-10 mb-4 text-foreground">{line.slice(3)}</h2>);
    } else if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(<p key={key++} className="font-bold text-foreground my-3">{line.slice(2, -2)}</p>);
    } else if (line.startsWith("- ")) {
      elements.push(<li key={key++} className="ml-5 text-foreground/80 leading-relaxed my-1 list-disc">{parseLine(line.slice(2))}</li>);
    } else if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={key++} className="border-l-4 border-emerald-500 pl-4 py-2 my-4 bg-emerald-50 rounded-r-lg text-sm text-emerald-900 italic">
          {line.slice(2)}
        </blockquote>
      );
    } else if (line === "---") {
      elements.push(<hr key={key++} className="border-foreground/10 my-8" />);
    } else if (line.trim() === "") {
      elements.push(<div key={key++} className="h-2" />);
    } else {
      elements.push(<p key={key++} className="text-foreground/80 leading-relaxed my-2">{parseLine(line)}</p>);
    }
  }
  return elements;
}

function parseLine(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i} className="font-bold text-foreground">{part.slice(2, -2)}</strong>
      : part
  );
}

export default function BlogPost({ slug }: Props) {
  const post = BLOG_POSTS.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="font-display text-2xl font-bold mb-4">找不到這篇文章</h1>
          <Link href="/blog" className="text-emerald-600 hover:underline no-underline">← 回到文章列表</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-10 max-w-2xl mx-auto">
        {/* Back */}
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground no-underline mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          回到文章列表
        </Link>

        <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {post.tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                <Tag className="w-2.5 h-2.5" />{tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="font-display text-2xl md:text-3xl font-bold leading-snug mb-4">{post.title}</h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-8 pb-8 border-b border-foreground/10">
            <span>{new Date(post.publishedAt).toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" })}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readingTime} 分鐘閱讀</span>
          </div>

          {/* Content */}
          <div className="prose-custom">
            {renderMarkdown(post.content)}
          </div>

          {/* CTA */}
          <div className="mt-12 p-6 card-brutal bg-emerald-50 border-emerald-200 rounded-lg text-center">
            <BookOpen className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
            <h3 className="font-display text-lg font-bold mb-2">立即開始科學化備考</h3>
            <p className="text-sm text-muted-foreground mb-5">每天 10 題免費深度詳解，系統自動對接知識比較表與常考陷阱</p>
            <Link href="/subjects"
              className="btn-capsule inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 text-white text-sm no-underline">
              免費開始刷題
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </motion.article>
      </div>
    </div>
  );
}
