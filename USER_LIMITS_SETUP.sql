-- User Usage Limits Setup
-- Run this in your Supabase SQL Editor to set up usage tracking and limits

-- Create global_limits table if it doesn't exist
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

-- Enable RLS
ALTER TABLE public.global_limits ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read global limits
CREATE POLICY "Anyone can read global limits" ON public.global_limits
    FOR SELECT USING (true);

-- Only admins can update global limits
CREATE POLICY "Admins can update global limits" ON public.global_limits
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- Create user_usage table if it doesn't exist
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

-- Enable RLS
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- Users can read their own usage
CREATE POLICY "Users can read own usage" ON public.user_usage
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own usage
CREATE POLICY "Users can insert own usage" ON public.user_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own usage
CREATE POLICY "Users can update own usage" ON public.user_usage
    FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_usage_user_date ON public.user_usage(user_id, usage_date);
CREATE INDEX IF NOT EXISTS idx_user_usage_date ON public.user_usage(usage_date);
