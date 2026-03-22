# 藥命 PharmVita — 上線部署指南

## 架構
```
Vercel（前端 React）
    ↕
Supabase（PostgreSQL + Auth + Edge Functions）
    ↕
Stripe（金流 Checkout + Webhook）
```

---

## 1. 設定 Supabase

1. 前往 [supabase.com](https://supabase.com) 建立新專案
2. 進入 **SQL Editor**，執行 `supabase/migrations/001_init.sql`
3. 進入 **Authentication > Settings**：
   - Enable Email Auth
   - 設定 Site URL 為 Vercel 網址（稍後填入）
   - Redirect URLs 加入 `https://your-domain.vercel.app/**`
4. 記錄以下值（Settings > API）：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`（用於 Edge Functions）

---

## 2. 設定 Stripe

1. 前往 [dashboard.stripe.com](https://dashboard.stripe.com) 建立帳號
2. **建立產品**（Products > Add product）：
   - 衝刺包：NT$599，One-time payment
   - 主力方案：NT$2,394，One-time payment
   - 安心包：NT$3,588，One-time payment
   - 記錄三個 Price ID（`price_xxx`）
3. 開啟 **Apple Pay / Google Pay**：Stripe Dashboard > Payment methods > 啟用 Apple Pay, Google Pay
4. 記錄 Secret Key（Developers > API keys > `sk_live_xxx`）

---

## 3. 部署 Supabase Edge Functions

```bash
# 安裝 Supabase CLI
npm install -g supabase

# 登入並連結專案
supabase login
supabase link --project-ref your-project-ref

# 設定 Secrets（只需設定一次）
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
supabase secrets set STRIPE_PRICE_MONTHLY=price_xxx
supabase secrets set STRIPE_PRICE_SEMIANNUAL=price_xxx
supabase secrets set STRIPE_PRICE_YEARLY=price_xxx
supabase secrets set FRONTEND_URL=https://your-domain.vercel.app

# 部署 functions
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
```

4. 設定 Stripe Webhook：
   - Stripe Dashboard > Developers > Webhooks > Add endpoint
   - URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
   - Events: `checkout.session.completed`, `checkout.session.expired`
   - 記錄 Webhook Secret（`whsec_xxx`）並更新 supabase secrets

---

## 4. 部署 Vercel（前端）

1. 前往 [vercel.com](https://vercel.com)，Import Git Repository
2. Framework Preset: **Vite**
3. 設定 Environment Variables：
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
4. Deploy！

---

## 5. 設定 Supabase Auth 回調 URL

部署完成後回到 Supabase：
- Authentication > URL Configuration
- Site URL: `https://your-domain.vercel.app`
- Redirect URLs: `https://your-domain.vercel.app/auth/login`

---

## 費用估算（月）

| 服務 | 免費方案 | 付費方案 |
|------|---------|---------|
| Vercel | 免費（個人） | $20/月（Pro）|
| Supabase | 免費（500MB DB, 2GB 流量）| $25/月（Pro）|
| Stripe | 無月費 | 每筆交易 3.4% + NT$5（台灣） |

**初期 0 月費** — 只有 Stripe 交易手續費。

---

## 本機開發

```bash
# 安裝套件
pnpm install

# 複製環境變數
cp .env.example .env.local
# 填入 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY

# 啟動開發伺服器
pnpm dev
```
