-- Add mgbeahuruchizaram587@gmail.com as admin
-- Run this in your Supabase SQL Editor

-- First, find the user_id for this email
-- Replace 'USER_ID_HERE' with the actual UUID from the query below

-- Step 1: Find the user ID (run this first to get the UUID)
SELECT id, email FROM auth.users WHERE email = 'mgbeahuruchizaram587@gmail.com';

-- Step 2: Insert the admin role (replace 'USER_ID_HERE' with the UUID from step 1)
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- If you want to do it in one query after the user signs up:
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin'::app_role
-- FROM auth.users
-- WHERE email = 'mgbeahuruchizaram587@gmail.com'
-- ON CONFLICT (user_id, role) DO NOTHING;
