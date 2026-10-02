create extension if not exists pgcrypto;
create table if not exists public.service_requests(id uuid primary key default gen_random_uuid(),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),name text not null,phone text not null,email text not null default '',machine_type text not null,problem text not null,location text not null,preferred_contact text not null default 'Call',status text not null default 'New' check(status in ('New','Contacted','Inspection Scheduled','In Progress','Completed','Closed')),admin_note text not null default '',photo_paths text[] not null default '{}');
create index if not exists service_requests_created_idx on public.service_requests(created_at desc);
create index if not exists service_requests_status_idx on public.service_requests(status);
alter table public.service_requests enable row level security;
create policy "block direct client access" on public.service_requests for all to authenticated using(false) with check(false);
insert into storage.buckets(id,name,public) values('service-uploads','service-uploads',false) on conflict(id) do nothing;
create policy "block direct storage access" on storage.objects for all to authenticated using(false) with check(false);