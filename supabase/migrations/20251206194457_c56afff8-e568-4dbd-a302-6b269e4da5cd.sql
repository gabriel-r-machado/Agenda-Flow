-- Insert existing clients from appointments into clients table
INSERT INTO public.clients (professional_id, name, phone, email)
SELECT DISTINCT 
  a.professional_id,
  a.client_name,
  a.client_phone,
  a.client_email
FROM public.appointments a
WHERE NOT EXISTS (
  SELECT 1 FROM public.clients c 
  WHERE c.professional_id = a.professional_id 
  AND c.phone = a.client_phone
);