# Database Setup Instructions

## User Messaging System

Run these SQL scripts in your Supabase SQL Editor to enable the secure messaging system between admin and users:

### 1. Create User Roles Table

```sql
-- Create enum for roles
create type public.app_role as enum ('admin', 'user');

-- Create user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null default 'user',
  created_at timestamptz default now(),
  unique (user_id, role)
);

-- Enable RLS
alter table public.user_roles enable row level security;

-- Create security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- RLS Policies
create policy "Users can view their own roles"
  on public.user_roles for select
  using (auth.uid() = user_id);

create policy "Admins can view all roles"
  on public.user_roles for select
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert roles"
  on public.user_roles for insert
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete roles"
  on public.user_roles for delete
  using (public.has_role(auth.uid(), 'admin'));
```

### 2. Create User Messages Table

```sql
-- Create user_messages table
create table public.user_messages (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid references auth.users(id) on delete cascade,
  to_user_id uuid references auth.users(id) on delete cascade,
  message text not null,
  is_broadcast boolean default false,
  created_at timestamptz default now(),
  read_at timestamptz
);

-- Enable RLS
alter table public.user_messages enable row level security;

-- Create index for performance
create index user_messages_to_user_id_idx on public.user_messages(to_user_id);
create index user_messages_from_user_id_idx on public.user_messages(from_user_id);
create index user_messages_created_at_idx on public.user_messages(created_at desc);

-- RLS Policies
-- Admins can view all messages
create policy "Admins can view all messages"
  on public.user_messages for select
  using (public.has_role(auth.uid(), 'admin'));

-- Users can view messages sent to them or broadcasts
create policy "Users can view their messages"
  on public.user_messages for select
  using (
    auth.uid() = to_user_id 
    or is_broadcast = true
    or auth.uid() = from_user_id
  );

-- Admins can send messages and broadcasts
create policy "Admins can send messages"
  on public.user_messages for insert
  with check (public.has_role(auth.uid(), 'admin'));

-- Users can send messages to admin only
create policy "Users can message admin"
  on public.user_messages for insert
  with check (
    auth.uid() = from_user_id 
    and not is_broadcast
    and exists (
      select 1 from public.user_roles 
      where user_id = to_user_id 
      and role = 'admin'
    )
  );

-- Users can mark their own messages as read
create policy "Users can mark messages as read"
  on public.user_messages for update
  using (auth.uid() = to_user_id)
  with check (auth.uid() = to_user_id);

-- Admins can update any message
create policy "Admins can update messages"
  on public.user_messages for update
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Admins can delete messages
create policy "Admins can delete messages"
  on public.user_messages for delete
  using (public.has_role(auth.uid(), 'admin'));
```

### 3. Set Yourself as Admin

Replace `YOUR_USER_ID` with your actual user ID from Supabase Auth:

```sql
insert into public.user_roles (user_id, role)
values ('YOUR_USER_ID', 'admin');
```

### 4. Enable Real-time (Optional but Recommended)

```sql
-- Enable real-time for user_messages
alter publication supabase_realtime add table public.user_messages;
```

---

# Database Setup Instructions (Original)

## Quick Setup - Run All SQL at Once

Go to your Supabase Dashboard → SQL Editor → New Query, then copy and paste ALL the SQL below and click "Run":

```sql
-- ============================================
-- STEP 1: Create User Roles System
-- ============================================

-- Create enum for roles
CREATE TYPE IF NOT EXISTS public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- STEP 2: Create Global Limits Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.global_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  text_generation_limit integer,
  image_generation_limit integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.global_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for global_limits
CREATE POLICY "Allow authenticated users to read limits"
  ON public.global_limits
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admins to insert limits"
  ON public.global_limits
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Allow admins to update limits"
  ON public.global_limits
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default record (unlimited)
INSERT INTO public.global_limits (text_generation_limit, image_generation_limit)
VALUES (null, null)
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 3: Create Announcements Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  ai_model_name text DEFAULT 'Admin',
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  likes integer DEFAULT 0,
  dislikes integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for announcements
CREATE POLICY "Allow all users to read announcements"
  ON public.announcements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admins to create announcements"
  ON public.announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Allow admins to update announcements"
  ON public.announcements
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Allow admins to delete announcements"
  ON public.announcements
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS announcements_created_at_idx ON public.announcements(created_at DESC);

-- Enable realtime for announcements
ALTER TABLE public.announcements REPLICA IDENTITY FULL;

-- ============================================
-- STEP 4: Create Announcement Reactions Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.announcement_reactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id uuid REFERENCES public.announcements(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reaction text NOT NULL CHECK (reaction IN ('like', 'dislike')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (announcement_id, user_id)
);

-- Enable RLS
ALTER TABLE public.announcement_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for announcement_reactions
CREATE POLICY "Allow all users to read reactions"
  ON public.announcement_reactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow users to manage their own reactions"
  ON public.announcement_reactions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS announcement_reactions_announcement_id_idx ON public.announcement_reactions(announcement_id);
CREATE INDEX IF NOT EXISTS announcement_reactions_user_id_idx ON public.announcement_reactions(user_id);
```

## After Running the SQL

1. **Make yourself an admin** (replace `YOUR_USER_ID` with your actual user ID):
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('YOUR_USER_ID', 'admin');
   ```

   To find your user ID, run:
   ```sql
   SELECT id, email FROM auth.users;
   ```

2. **Refresh your app** - All features should now work!

## What This Sets Up

✅ **User Roles** - Admin permissions with secure RLS  
✅ **Usage Limits** - Control daily text/image generation  
✅ **Announcements** - Broadcast messages to all users  
✅ **Reactions** - Like/dislike announcements  
✅ **Real-time Updates** - Announcements update live

## Troubleshooting

- **"relation does not exist"** → Run the SQL above
- **"permission denied"** → Make sure you're logged in and marked as admin
- **Can't send announcements** → Verify you're in the `user_roles` table with role='admin'
