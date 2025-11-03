-- SQL Setup for Announcements and Announcement Likes
-- Run this in your Supabase Dashboard → SQL Editor

-- Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create announcement_likes table
CREATE TABLE IF NOT EXISTS public.announcement_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id uuid REFERENCES public.announcements(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(announcement_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for announcements (everyone can view, only authenticated can create, only creator can delete)
CREATE POLICY "Anyone can view announcements"
  ON public.announcements
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert announcements"
  ON public.announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own announcements"
  ON public.announcements
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- RLS Policies for announcement_likes
CREATE POLICY "Anyone can view announcement likes"
  ON public.announcement_likes
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert announcement likes"
  ON public.announcement_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own announcement likes"
  ON public.announcement_likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcement_likes_announcement ON public.announcement_likes(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_likes_user ON public.announcement_likes(user_id);

-- Enable Realtime for announcements
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcement_likes;

-- Set replica identity for realtime updates
ALTER TABLE public.announcements REPLICA IDENTITY FULL;
ALTER TABLE public.announcement_likes REPLICA IDENTITY FULL;
