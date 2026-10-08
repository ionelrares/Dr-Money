create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'pending' check (status in ('pending','confirmed','unsubscribed')),
  confirmation_token text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create index if not exists newsletter_subscribers_token_idx
on public.newsletter_subscribers (confirmation_token);

alter table public.newsletter_subscribers enable row level security;

-- No public policies: browser clients must never be allowed to read or modify subscriber data.
-- The Vercel API uses SUPABASE_SERVICE_ROLE_KEY server-side.