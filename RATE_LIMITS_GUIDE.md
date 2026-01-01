# ZARA AI HUB - Rate Limits Setup Guide

This guide explains how to set up and use the user rate limiting system for your ZARA AI HUB application.

## Overview

The rate limiting system provides:
- **Daily limits** for text and image generations (resets every 24 hours at midnight UTC)
- **Admin unlimited access** - users with admin role bypass all limits
- **Global configurable limits** - admins can adjust limits from the admin panel

---

## Step 1: Run the SQL Setup

Copy and run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor → New Query):

```sql
-- ============================================
-- ZARA AI HUB - Rate Limits Database Setup
-- ============================================

-- 1. Create app_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create user_roles table for role management
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
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

-- 4. RLS Policies for user_roles
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 5. Create global_limits table for configurable limits
CREATE TABLE IF NOT EXISTS public.global_limits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    text_limit_enabled boolean DEFAULT true,
    text_limit integer DEFAULT 50,
    image_limit_enabled boolean DEFAULT true,
    image_limit integer DEFAULT 20,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default limits if table is empty
INSERT INTO public.global_limits (text_limit_enabled, text_limit, image_limit_enabled, image_limit)
SELECT true, 50, true, 20
WHERE NOT EXISTS (SELECT 1 FROM public.global_limits);

-- Enable RLS on global_limits
ALTER TABLE public.global_limits ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for global_limits
DROP POLICY IF EXISTS "Anyone can read global limits" ON public.global_limits;
CREATE POLICY "Anyone can read global limits" ON public.global_limits
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update global limits" ON public.global_limits;
CREATE POLICY "Admins can update global limits" ON public.global_limits
    FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert global limits" ON public.global_limits;
CREATE POLICY "Admins can insert global limits" ON public.global_limits
    FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. Create user_usage table for tracking daily usage
CREATE TABLE IF NOT EXISTS public.user_usage (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    usage_date date NOT NULL,
    text_generations integer DEFAULT 0,
    image_generations integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, usage_date)
);

-- Enable RLS on user_usage
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for user_usage
DROP POLICY IF EXISTS "Users can read own usage" ON public.user_usage;
CREATE POLICY "Users can read own usage" ON public.user_usage
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own usage" ON public.user_usage;
CREATE POLICY "Users can insert own usage" ON public.user_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own usage" ON public.user_usage;
CREATE POLICY "Users can update own usage" ON public.user_usage
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read all usage" ON public.user_usage;
CREATE POLICY "Admins can read all usage" ON public.user_usage
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_usage_user_date ON public.user_usage(user_id, usage_date);
CREATE INDEX IF NOT EXISTS idx_user_usage_date ON public.user_usage(usage_date);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- 10. Function to clean up old usage data (optional - run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_old_usage()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM public.user_usage
  WHERE usage_date < CURRENT_DATE - INTERVAL '30 days';
$$;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
```

---

## Step 2: Make Yourself an Admin

After running the setup, make yourself an admin by running this SQL (replace the email):

```sql
-- Replace 'your-email@example.com' with your actual email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

---

## How It Works

### For Regular Users:
1. **Daily Limits**: Each user gets a set number of text and image generations per day
2. **Usage Tracking**: Every generation is counted and stored in `user_usage` table
3. **Reset Time**: Limits reset at midnight UTC each day
4. **Limit Display**: Users see their remaining quota in the app

### For Admins:
1. **Unlimited Access**: Admin users bypass all rate limits
2. **Configure Limits**: Change global limits from the admin panel
3. **View Usage**: See all user usage statistics

### Default Limits:
| Type | Default Limit |
|------|--------------|
| Text Generations | 50/day |
| Image Generations | 20/day |

---

## Adjusting Limits

### Via Admin Panel (Recommended):
1. Log in as admin
2. Go to Settings → Admin Panel
3. Navigate to "Usage Limits Manager"
4. Adjust text/image limits
5. Enable/disable limits as needed

### Via SQL:
```sql
-- Update limits directly
UPDATE public.global_limits
SET 
    text_limit = 100,
    image_limit = 50,
    text_limit_enabled = true,
    image_limit_enabled = true,
    updated_at = now();
```

---

## Tables Reference

### `user_roles`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | References auth.users |
| role | app_role | 'admin', 'moderator', or 'user' |
| created_at | timestamp | When role was assigned |

### `global_limits`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| text_limit_enabled | boolean | Enable text limits |
| text_limit | integer | Max text generations/day |
| image_limit_enabled | boolean | Enable image limits |
| image_limit | integer | Max image generations/day |

### `user_usage`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | References auth.users |
| usage_date | date | The date of usage |
| text_generations | integer | Count of text generations |
| image_generations | integer | Count of image generations |

---

## Troubleshooting

### "Permission denied" errors:
- Ensure RLS policies are created correctly
- Verify you're logged in as the correct user
- Check if the `has_role` function exists

### Limits not working:
- Verify `global_limits` table has a row
- Check that limits are enabled (not just set to 0)
- Ensure the app is reading from the correct table

### Admin features not available:
- Verify your user has 'admin' role in `user_roles`
- Check that `has_role` function returns true for your user

---

## Security Notes

1. **Role Storage**: Roles are stored in a separate table (not in user metadata) to prevent privilege escalation
2. **RLS Protection**: All tables use Row-Level Security
3. **Security Definer**: The `has_role` function runs with elevated privileges to avoid RLS recursion
4. **Server-Side Validation**: Always validate limits on the server side, not just client side

---

## Questions?

If you run into issues, check:
1. Supabase Dashboard → Table Editor → Verify tables exist
2. Supabase Dashboard → Database → Functions → Verify `has_role` exists
3. Browser Console → Check for any error messages
