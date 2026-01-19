-- Add category column to profiles (replacing free-text profession)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS category text;

-- Create feed_posts table with 1 post per professional limit
CREATE TABLE IF NOT EXISTS public.feed_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT one_post_per_professional UNIQUE(professional_id)
);

-- Enable RLS
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;

-- RLS: Public can view active posts from professional subscribers
CREATE POLICY "Public can view active feed posts"
ON public.feed_posts
FOR SELECT
USING (
  is_active = true AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = feed_posts.professional_id
    AND profiles.subscription_status = 'active'
  )
);

-- RLS: Professionals can manage their own posts
CREATE POLICY "Professionals can manage their feed posts"
ON public.feed_posts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = feed_posts.professional_id
    AND profiles.user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_feed_posts_updated_at
BEFORE UPDATE ON public.feed_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for feed post images
INSERT INTO storage.buckets (id, name, public)
VALUES ('feed-posts', 'feed-posts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for feed-posts bucket
CREATE POLICY "Feed post images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'feed-posts');

CREATE POLICY "Authenticated users can upload feed post images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'feed-posts' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own feed post images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'feed-posts' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own feed post images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'feed-posts' AND auth.role() = 'authenticated');