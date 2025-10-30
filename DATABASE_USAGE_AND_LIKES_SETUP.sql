-- SQL Setup for User Usage Tracking, Model Likes, and Announcement Comments
-- Run this in your Supabase Dashboard → SQL Editor

-- Create user_usage table to track daily usage
CREATE TABLE IF NOT EXISTS public.user_usage (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  usage_date date DEFAULT CURRENT_DATE NOT NULL,
  text_generations integer DEFAULT 0 NOT NULL,
  image_generations integer DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, usage_date)
);

-- Create model_likes table to store likes for AI models
CREATE TABLE IF NOT EXISTS public.model_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  model_id text NOT NULL,
  model_type text NOT NULL CHECK (model_type IN ('text', 'image')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, model_id, model_type)
);

-- Create announcement_comments table to store comments on announcements
CREATE TABLE IF NOT EXISTS public.announcement_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id uuid NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username text NOT NULL,
  comment_text text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_usage
CREATE POLICY "Users can view their own usage"
  ON public.user_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
  ON public.user_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
  ON public.user_usage
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for model_likes
CREATE POLICY "Anyone can view all model likes"
  ON public.model_likes
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert likes"
  ON public.model_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON public.model_likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for announcement_comments
CREATE POLICY "Anyone can view announcement comments"
  ON public.announcement_comments
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON public.announcement_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.announcement_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.announcement_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_usage_user_date ON public.user_usage(user_id, usage_date);
CREATE INDEX IF NOT EXISTS idx_model_likes_model ON public.model_likes(model_id, model_type);
CREATE INDEX IF NOT EXISTS idx_announcement_comments_announcement ON public.announcement_comments(announcement_id);
