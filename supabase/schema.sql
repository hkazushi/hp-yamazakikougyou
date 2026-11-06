-- Supabase の SQL エディタで1回実行する。
-- サイトはサーバー側から service role キーで読み書きするので、RLS を有効にしてポリシーは作らない
-- （anon キーからはテーブルに触れない）。

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('work', 'news')),
  title text not null,
  body text not null default '',
  images jsonb not null default '[]'::jsonb,
  published boolean not null default true,
  date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists posts_list_idx on public.posts (type, published, date desc, created_at desc);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  company text not null default '',
  name text not null,
  phone text not null default '',
  email text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;
alter table public.inquiries enable row level security;

-- 画像置き場。公開バケットなので URL を知っていれば誰でも見られる（サイトに載せる写真専用）
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;
