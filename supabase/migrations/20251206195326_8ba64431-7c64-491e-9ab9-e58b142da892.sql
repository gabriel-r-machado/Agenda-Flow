-- Create reminders table
CREATE TABLE public.reminders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  priority integer NOT NULL DEFAULT 2, -- 1=alta, 2=média, 3=baixa
  is_completed boolean DEFAULT false,
  due_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Professionals can manage their reminders"
ON public.reminders
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = reminders.professional_id 
  AND profiles.user_id = auth.uid()
));

-- Trigger for updated_at
CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON public.reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();