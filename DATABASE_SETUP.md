# Database Setup Instructions

## Required Tables

You need to create two tables in your Supabase database to fix the "Failed to load limits" and "Failed to send" errors.

### 1. Create `global_limits` Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create global_limits table for usage limits
CREATE TABLE IF NOT EXISTS public.global_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  text_generation_limit integer,
  image_generation_limit integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.global_limits ENABLE ROW LEVEL SECURITY;

-- Allow all users to read limits
CREATE POLICY "Allow all users to read limits"
  ON public.global_limits
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert limits
CREATE POLICY "Allow authenticated users to insert limits"
  ON public.global_limits
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update limits
CREATE POLICY "Allow authenticated users to update limits"
  ON public.global_limits
  FOR UPDATE
  TO authenticated
  USING (true);
```

### 2. Create `announcements` Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create announcements table
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

-- Allow all authenticated users to read announcements
CREATE POLICY "Allow all users to read announcements"
  ON public.announcements
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert announcements
CREATE POLICY "Allow authenticated users to create announcements"
  ON public.announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Allow creators to update their own announcements
CREATE POLICY "Allow users to update their own announcements"
  ON public.announcements
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Allow creators to delete their own announcements
CREATE POLICY "Allow users to delete their own announcements"
  ON public.announcements
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS announcements_created_at_idx ON public.announcements(created_at DESC);
```

## How to Run These SQL Commands

1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the SQL for the first table, then click "Run"
5. Repeat for the second table

After running these commands, your admin panel should work correctly!
