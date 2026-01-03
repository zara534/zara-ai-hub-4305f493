-- ============================================
-- ZARA AI HUB - Pro Subscription & Usage Limits Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create subscription tier enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier') THEN
    CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'unlimited');
  END IF;
END $$;

-- 2. Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tier subscription_tier DEFAULT 'free' NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create global_limits table (if not exists)
CREATE TABLE IF NOT EXISTS public.global_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Free tier limits
  free_text_limit INTEGER DEFAULT 10,
  free_image_limit INTEGER DEFAULT 5,
  -- Pro tier limits
  pro_text_limit INTEGER DEFAULT 100,
  pro_image_limit INTEGER DEFAULT 50,
  -- Unlimited tier has no limits (null means unlimited)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create user_usage table (if not exists)
CREATE TABLE IF NOT EXISTS public.user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  usage_date DATE DEFAULT CURRENT_DATE NOT NULL,
  text_generations INTEGER DEFAULT 0,
  image_generations INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, usage_date)
);

-- 5. Insert default global limits if not exists
INSERT INTO public.global_limits (free_text_limit, free_image_limit, pro_text_limit, pro_image_limit)
SELECT 10, 5, 100, 50
WHERE NOT EXISTS (SELECT 1 FROM public.global_limits);

-- 6. Enable RLS on all tables
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- 7. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admins can update subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Anyone can view global limits" ON public.global_limits;
DROP POLICY IF EXISTS "Admins can update global limits" ON public.global_limits;
DROP POLICY IF EXISTS "Users can view own usage" ON public.user_usage;
DROP POLICY IF EXISTS "Users can insert own usage" ON public.user_usage;
DROP POLICY IF EXISTS "Users can update own usage" ON public.user_usage;

-- 8. Create RLS policies for user_subscriptions
CREATE POLICY "Users can view own subscription"
  ON public.user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON public.user_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update subscriptions"
  ON public.user_subscriptions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 9. Create RLS policies for global_limits
CREATE POLICY "Anyone can view global limits"
  ON public.global_limits FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update global limits"
  ON public.global_limits FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 10. Create RLS policies for user_usage
CREATE POLICY "Users can view own usage"
  ON public.user_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON public.user_usage FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
  ON public.user_usage FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 11. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_date ON public.user_usage(user_id, usage_date);

-- 12. Function to get user's effective limits
CREATE OR REPLACE FUNCTION public.get_user_limits(p_user_id UUID)
RETURNS TABLE (
  text_limit INTEGER,
  image_limit INTEGER,
  tier TEXT,
  is_unlimited BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier subscription_tier;
  v_is_admin BOOLEAN;
BEGIN
  -- Check if user is admin (unlimited)
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_user_id AND role = 'admin'
  ) INTO v_is_admin;
  
  IF v_is_admin THEN
    RETURN QUERY SELECT NULL::INTEGER, NULL::INTEGER, 'admin'::TEXT, TRUE;
    RETURN;
  END IF;
  
  -- Get user's subscription tier
  SELECT COALESCE(s.tier, 'free') INTO v_tier
  FROM public.user_subscriptions s
  WHERE s.user_id = p_user_id
    AND (s.expires_at IS NULL OR s.expires_at > NOW());
  
  IF v_tier IS NULL THEN
    v_tier := 'free';
  END IF;
  
  -- Return limits based on tier
  IF v_tier = 'unlimited' THEN
    RETURN QUERY SELECT NULL::INTEGER, NULL::INTEGER, 'unlimited'::TEXT, TRUE;
  ELSIF v_tier = 'pro' THEN
    RETURN QUERY 
      SELECT g.pro_text_limit, g.pro_image_limit, 'pro'::TEXT, FALSE
      FROM public.global_limits g
      LIMIT 1;
  ELSE
    RETURN QUERY 
      SELECT g.free_text_limit, g.free_image_limit, 'free'::TEXT, FALSE
      FROM public.global_limits g
      LIMIT 1;
  END IF;
END;
$$;

-- 13. Function to check if user can generate
CREATE OR REPLACE FUNCTION public.can_user_generate(
  p_user_id UUID,
  p_type TEXT -- 'text' or 'image'
)
RETURNS TABLE (
  can_generate BOOLEAN,
  current_usage INTEGER,
  daily_limit INTEGER,
  remaining INTEGER,
  tier TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_limits RECORD;
  v_current_usage INTEGER;
  v_limit INTEGER;
BEGIN
  -- Get user limits
  SELECT * INTO v_limits FROM public.get_user_limits(p_user_id);
  
  -- If unlimited, always allow
  IF v_limits.is_unlimited THEN
    RETURN QUERY SELECT TRUE, 0, NULL::INTEGER, NULL::INTEGER, v_limits.tier;
    RETURN;
  END IF;
  
  -- Get current usage
  IF p_type = 'text' THEN
    SELECT COALESCE(u.text_generations, 0) INTO v_current_usage
    FROM public.user_usage u
    WHERE u.user_id = p_user_id AND u.usage_date = CURRENT_DATE;
    v_limit := v_limits.text_limit;
  ELSE
    SELECT COALESCE(u.image_generations, 0) INTO v_current_usage
    FROM public.user_usage u
    WHERE u.user_id = p_user_id AND u.usage_date = CURRENT_DATE;
    v_limit := v_limits.image_limit;
  END IF;
  
  v_current_usage := COALESCE(v_current_usage, 0);
  
  RETURN QUERY SELECT 
    v_current_usage < v_limit,
    v_current_usage,
    v_limit,
    GREATEST(0, v_limit - v_current_usage),
    v_limits.tier;
END;
$$;

-- Done!
-- After running this, users will have:
-- Free tier: 10 text / 5 image per day
-- Pro tier: 100 text / 50 image per day
-- Admin/Unlimited: No limits
