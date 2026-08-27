create extension if not exists pgcrypto;
create table if not exists public.profiles(id uuid primary key references auth.users(id) on delete cascade,full_name text default '',email text unique not null,role text default 'user' check(role in('user','admin')),created_at timestamptz default now());
create table if not exists public.ads(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,business_name text not null,category text not null,district text not null,area text not null,address text not null,phone text not null,website text,facebook text,description text not null,image_url text,status text default 'pending' check(status in('pending','approved','rejected')),rejection_reason text,featured boolean default false,created_at timestamptz default now(),updated_at timestamptz default now());
create table if not exists public.payments(id uuid primary key default gen_random_uuid(),user_id uuid references auth.users(id) on delete set null,ad_id uuid references public.ads(id) on delete set null,amount numeric not null,method text not null check(method in('bkash','nagad')),transaction_id text,status text default 'pending' check(status in('pending','paid','rejected')),created_at timestamptz default now(),package text,expires_at timestamptz);
alter table public.profiles enable row level security; alter table public.ads enable row level security; alter table public.payments enable row level security;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$select exists(select 1 from public.profiles where id=auth.uid() and role='admin')$$;
create policy "profile read" on public.profiles for select using(id=auth.uid() or public.is_admin());
create policy "ads read" on public.ads for select using(status='approved' or user_id=auth.uid() or public.is_admin());
create policy "ads insert" on public.ads for insert with check(user_id=auth.uid());
create policy "ads update" on public.ads for update using(user_id=auth.uid() or public.is_admin()) with check(user_id=auth.uid() or public.is_admin());
create policy "ads delete" on public.ads for delete using(user_id=auth.uid() or public.is_admin());
create policy "payments own read" on public.payments for select using(user_id=auth.uid() or public.is_admin());
create policy "payments own insert" on public.payments for insert with check(user_id=auth.uid());
create policy "payments admin update" on public.payments for update using(public.is_admin()) with check(public.is_admin());
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$begin insert into public.profiles(id,full_name,email) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),new.email) on conflict(id) do nothing; return new; end;$$;
drop trigger if exists on_auth_user_created on auth.users; create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
insert into storage.buckets(id,name,public) values('ad-images','ad-images',true) on conflict(id) do nothing;
create policy "images public" on storage.objects for select using(bucket_id='ad-images');
create policy "images upload" on storage.objects for insert to authenticated with check(bucket_id='ad-images' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "images update" on storage.objects for update to authenticated using(bucket_id='ad-images' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "images delete" on storage.objects for delete to authenticated using(bucket_id='ad-images' and (storage.foldername(name))[1]=auth.uid()::text);
-- নিজের account admin করতে:
-- update public.profiles set role='admin' where email='YOUR_EMAIL';

-- Safe upgrade for an existing v2 database:
alter table public.ads add column if not exists promotion_expires_at timestamptz;
alter table public.payments add column if not exists package text;

-- Production payment activation rule:
-- Do NOT let the browser mark payments as paid.
-- A trusted server-side gateway callback/verification function must:
-- 1) verify the bKash/Nagad transaction with the gateway
-- 2) set payments.status='paid'
-- 3) set ads.featured=true
-- 4) set ads.promotion_expires_at = now() + the package duration
