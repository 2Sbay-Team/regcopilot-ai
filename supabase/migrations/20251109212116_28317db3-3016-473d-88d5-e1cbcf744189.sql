-- Help Feedback & Analytics Tables
create table if not exists public.help_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  doc_path text not null,
  helpful boolean not null,
  comment text,
  language text default 'en',
  created_at timestamp with time zone default now()
);

create table if not exists public.help_search_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  query text not null,
  result_found boolean not null,
  language text default 'en',
  result_count integer default 0,
  created_at timestamp with time zone default now()
);

create table if not exists public.help_articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  content text not null,
  language text not null default 'en',
  category text not null,
  tags text[] default array[]::text[],
  view_count integer default 0,
  helpful_count integer default 0,
  unhelpful_count integer default 0,
  screenshot_url text,
  video_url text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.help_feedback enable row level security;
alter table public.help_search_logs enable row level security;
alter table public.help_articles enable row level security;

-- RLS Policies for help_feedback
create policy "Users can view own feedback"
  on public.help_feedback for select
  using (auth.uid() = user_id);

create policy "Users can insert own feedback"
  on public.help_feedback for insert
  with check (auth.uid() = user_id);

-- RLS Policies for help_search_logs
create policy "Users can view own search logs"
  on public.help_search_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own search logs"
  on public.help_search_logs for insert
  with check (auth.uid() = user_id);

-- RLS Policies for help_articles
create policy "Anyone can view help articles"
  on public.help_articles for select
  using (true);

create policy "Admins can manage help articles"
  on public.help_articles for all
  using (public.has_role(auth.uid(), 'admin'));

-- Indexes for performance
create index idx_help_feedback_user_id on public.help_feedback(user_id);
create index idx_help_feedback_doc_path on public.help_feedback(doc_path);
create index idx_help_feedback_created_at on public.help_feedback(created_at);

create index idx_help_search_logs_query on public.help_search_logs using gin(to_tsvector('english', query));
create index idx_help_search_logs_created_at on public.help_search_logs(created_at);

create index idx_help_articles_slug on public.help_articles(slug);
create index idx_help_articles_language on public.help_articles(language);
create index idx_help_articles_category on public.help_articles(category);
create index idx_help_articles_tags on public.help_articles using gin(tags);

-- Trigger for updated_at
create or replace function public.update_help_articles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_help_articles_updated_at
  before update on public.help_articles
  for each row
  execute function public.update_help_articles_updated_at();