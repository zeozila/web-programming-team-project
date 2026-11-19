-- SeoulBaatar: table for trip reviews (run once in Supabase → SQL Editor)

create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  trip_id text not null check (char_length(trip_id) between 1 and 40),
  name text not null check (char_length(name) between 1 and 40),
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 10 and 600),
  created_at timestamptz not null default now()
);

-- Row Level Security: visitors may read and add reviews, but never edit or delete them.
alter table public.reviews enable row level security;

drop policy if exists "Anyone can read reviews" on public.reviews;
create policy "Anyone can read reviews" on public.reviews
  for select to anon, authenticated using (true);

drop policy if exists "Anyone can add a review" on public.reviews;
create policy "Anyone can add a review" on public.reviews
  for insert to anon, authenticated with check (true);

grant select, insert on public.reviews to anon, authenticated;
