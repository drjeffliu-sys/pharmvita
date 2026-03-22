-- ============================================================
-- PharmVita 資料庫 Schema
-- ============================================================

-- subscriptions 訂閱狀態
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'free', -- 'free' | 'monthly' | 'yearly'
  status text not null default 'inactive', -- 'active' | 'inactive' | 'canceled'
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- progress 雲端進度（付費會員同步用）
create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);

-- daily_explanation_usage 免費版每日詳解使用量
create table if not exists public.daily_explanation_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  used_date date not null default current_date,
  count integer not null default 0,
  unique(user_id, used_date)
);

-- orders 訂單紀錄
create table if not exists public.orders (
  id text primary key, -- Stripe checkout session ID
  user_id uuid references auth.users(id) on delete set null,
  plan text not null,
  amount integer not null, -- 新台幣分
  currency text not null default 'twd',
  status text not null default 'pending', -- 'pending' | 'paid' | 'failed'
  stripe_payment_intent_id text,
  created_at timestamptz default now()
);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

alter table public.subscriptions enable row level security;
alter table public.progress enable row level security;
alter table public.daily_explanation_usage enable row level security;
alter table public.orders enable row level security;

-- subscriptions: users can only read their own
create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- progress: users can read/write their own
create policy "Users can view own progress"
  on public.progress for select
  using (auth.uid() = user_id);

create policy "Users can upsert own progress"
  on public.progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.progress for update
  using (auth.uid() = user_id);

create policy "Users can delete own progress"
  on public.progress for delete
  using (auth.uid() = user_id);

-- daily_explanation_usage: users can read/write their own
create policy "Users can view own usage"
  on public.daily_explanation_usage for select
  using (auth.uid() = user_id);

create policy "Users can upsert own usage"
  on public.daily_explanation_usage for insert
  with check (auth.uid() = user_id);

create policy "Users can update own usage"
  on public.daily_explanation_usage for update
  using (auth.uid() = user_id);

-- orders: users can only view their own orders
create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

-- ============================================================
-- Auto-create free subscription on new user signup
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Helper: increment daily explanation usage
-- ============================================================

create or replace function public.increment_explanation_usage(p_user_id uuid)
returns integer as $$
declare
  current_count integer;
begin
  insert into public.daily_explanation_usage (user_id, used_date, count)
  values (p_user_id, current_date, 1)
  on conflict (user_id, used_date)
  do update set count = daily_explanation_usage.count + 1
  returning count into current_count;
  return current_count;
end;
$$ language plpgsql security definer;
