-- SQL Setup for AI Models and Image Models in Supabase
-- Run this in your Supabase Dashboard → SQL Editor

-- Create ai_models table
CREATE TABLE IF NOT EXISTS public.ai_models (
  id text PRIMARY KEY,
  name text NOT NULL,
  behavior text NOT NULL,
  emoji text NOT NULL,
  system_prompt text,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create image_models table
CREATE TABLE IF NOT EXISTS public.image_models (
  id text PRIMARY KEY,
  name text NOT NULL,
  emoji text,
  api_endpoint text NOT NULL,
  description text,
  model_type text,
  system_prompt text,
  example_prompts jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_models ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_models (all users can read and write)
-- Note: This app uses local admin password authentication, not Supabase auth
CREATE POLICY "Anyone can view AI models"
  ON public.ai_models
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert AI models"
  ON public.ai_models
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update AI models"
  ON public.ai_models
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete AI models"
  ON public.ai_models
  FOR DELETE
  USING (true);

-- RLS Policies for image_models (all users can read and write)
-- Note: This app uses local admin password authentication, not Supabase auth
CREATE POLICY "Anyone can view image models"
  ON public.image_models
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert image models"
  ON public.image_models
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update image models"
  ON public.image_models
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete image models"
  ON public.image_models
  FOR DELETE
  USING (true);

-- Insert default AI models
INSERT INTO public.ai_models (id, name, behavior, emoji, system_prompt, description) VALUES
  ('1', 'Creative Writer', 'A creative and imaginative AI that writes engaging stories and content', '✍️', 'You are a creative writing assistant. Help users craft compelling narratives, develop characters, and refine their writing style.', 'Expert in creative writing, storytelling, and content creation'),
  ('2', 'Code Helper', 'An AI specialized in programming and technical explanations', '💻', 'You are a programming expert. Provide clear code examples, debug issues, and explain technical concepts.', 'Specialized in coding, debugging, and technical problem-solving')
ON CONFLICT (id) DO NOTHING;

-- Insert default image models
INSERT INTO public.image_models (id, name, emoji, api_endpoint, description, model_type, system_prompt, example_prompts) VALUES
  ('flux', 'Flux', '⚡', 'https://image.pollinations.ai/prompt', 'High quality image generation (Default)', 'flux', 'Generate high-quality, detailed images', '["A beautiful sunset over mountains", "A cute cat wearing sunglasses"]'::jsonb),
  ('stable-diffusion-xl', 'Stable Diffusion XL', '🎨', 'https://image.pollinations.ai/prompt', 'Stable Diffusion XL model for creative images', 'stable-diffusion-xl', 'Create artistic and creative images', '["Abstract art with vibrant colors", "Fantasy landscape with dragons"]'::jsonb),
  ('dall-e-3', 'DALL-E 3', '🖼️', 'https://image.pollinations.ai/prompt', 'OpenAI''s DALL-E 3 for photorealistic images', 'dall-e-3', 'Generate photorealistic and detailed images', '["Photorealistic portrait of a person", "Modern architecture building"]'::jsonb),
  ('playground-v2.5', 'Playground v2.5', '🎪', 'https://image.pollinations.ai/prompt', 'Playground v2.5 for diverse styles', 'playground-v2.5', 'Create diverse artistic styles', '["Cartoon character design", "Sci-fi spaceship concept art"]'::jsonb),
  ('dpo', 'DPO', '🚀', 'https://image.pollinations.ai/prompt', 'DPO model for optimized generation', 'dpo', 'Generate optimized images efficiently', '["Logo design for tech startup", "Minimalist poster design"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
