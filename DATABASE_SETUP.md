# Database Setup Instructions

## ⚠️ IMPORTANT: Required Database Setup

For the AI models and Image models to sync across all users, you **MUST** run the SQL setup in Supabase.

## Step 1: AI Models & Image Models Setup (REQUIRED)

**DO THIS FIRST - Your app won't work properly without this!**

1. Open your Supabase Dashboard → SQL Editor
2. Copy ALL the SQL from `DATABASE_MODELS_SETUP.sql`
3. Paste and run it in the SQL Editor
4. You should see success messages for table creation, RLS policies, and default data insertion

This creates:
- ✅ `ai_models` table - stores text AI generators (syncs across all users)
- ✅ `image_models` table - stores image AI generators (syncs across all users)  
- ✅ Default models (Creative Writer, Code Helper, Flux, DALL-E 3, etc.)

**After running the SQL:**
- When you add/edit models from the admin panel, all users see the changes immediately
- No more localStorage - everything syncs via Supabase

**Security Note:** See `SECURITY_NOTE.md` for important information about access control if deploying publicly.

## Step 2: Usage Tracking, Likes & Comments Setup (REQUIRED)

**This is also mandatory for rate limiting and social features to work!**

Run the SQL from `DATABASE_USAGE_AND_LIKES_SETUP.sql` in your Supabase Dashboard → SQL Editor.

This creates:
- ✅ `user_usage` table - tracks daily usage for rate limiting (syncs across devices)
- ✅ `model_likes` table - stores likes for AI models (syncs across devices)
- ✅ `announcement_comments` table - stores comments on announcements (syncs across devices)

**After running the SQL:**
- Rate limits will be enforced properly
- Users will see their daily usage count
- Likes and comments will sync across all devices
- Everything stored centrally in Supabase

## Step 3: User Profiles Setup (Optional)

If you want the AI to know users' names, run this SQL in your Supabase Dashboard → SQL Editor:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## What This Sets Up

✅ **User Profiles** - Username storage for AI personalization  
✅ **Admin Announcements** - Works with your existing admin password (no database setup needed!)

## Notes

- Admin announcements use localStorage and work immediately with your admin password
- Username feature requires the SQL above if you want AI to address users by name
- No admin roles table needed - uses your existing AdminLogin system
