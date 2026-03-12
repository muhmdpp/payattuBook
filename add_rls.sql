-- 1. Add user_id column to all tables, defaulting to the currently authenticated user
alter table public.members add column if not exists user_id uuid default auth.uid() references auth.users(id) on delete cascade;
alter table public.events add column if not exists user_id uuid default auth.uid() references auth.users(id) on delete cascade;
alter table public.transactions add column if not exists user_id uuid default auth.uid() references auth.users(id) on delete cascade;

-- 2. Enable Row Level Security (RLS)
alter table public.members enable row level security;
alter table public.events enable row level security;
alter table public.transactions enable row level security;

-- 3. Create Policies for Members
create policy "Users can view their own members" on public.members for select using (auth.uid() = user_id);
create policy "Users can insert their own members" on public.members for insert with check (auth.uid() = user_id);
create policy "Users can update their own members" on public.members for update using (auth.uid() = user_id);
create policy "Users can delete their own members" on public.members for delete using (auth.uid() = user_id);

-- 4. Create Policies for Events
create policy "Users can view their own events" on public.events for select using (auth.uid() = user_id);
create policy "Users can insert their own events" on public.events for insert with check (auth.uid() = user_id);
create policy "Users can update their own events" on public.events for update using (auth.uid() = user_id);
create policy "Users can delete their own events" on public.events for delete using (auth.uid() = user_id);

-- 5. Create Policies for Transactions
create policy "Users can view their own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Users can insert their own transactions" on public.transactions for insert with check (auth.uid() = user_id);
create policy "Users can update their own transactions" on public.transactions for update using (auth.uid() = user_id);
create policy "Users can delete their own transactions" on public.transactions for delete using (auth.uid() = user_id);
