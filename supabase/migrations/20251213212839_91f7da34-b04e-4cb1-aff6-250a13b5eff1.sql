-- Add interval_minutes column to availability table for custom time intervals
ALTER TABLE public.availability ADD COLUMN IF NOT EXISTS interval_minutes integer DEFAULT 30;

-- Add time exceptions table for specific date overrides
CREATE TABLE IF NOT EXISTS public.availability_exceptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exception_date date NOT NULL,
  start_time time without time zone,
  end_time time without time zone,
  is_blocked boolean DEFAULT false,
  reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(professional_id, exception_date)
);

-- Enable RLS
ALTER TABLE public.availability_exceptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for availability_exceptions
CREATE POLICY "Professionals can manage their exceptions"
ON public.availability_exceptions
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = availability_exceptions.professional_id
  AND profiles.user_id = auth.uid()
));

CREATE POLICY "Exceptions are viewable by everyone"
ON public.availability_exceptions
FOR SELECT
USING (true);

-- Add gallery, testimonials, faq, social_links columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gallery text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS testimonials jsonb DEFAULT '[]';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS faq jsonb DEFAULT '[]';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}';

-- Create trigger for updated_at on availability_exceptions
CREATE TRIGGER update_availability_exceptions_updated_at
BEFORE UPDATE ON public.availability_exceptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();