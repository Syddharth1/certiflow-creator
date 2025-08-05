-- Add RLS policy to allow users to view certificates they received
CREATE POLICY "Users can view certificates they received" 
ON public.certificates 
FOR SELECT 
USING (auth.email() = recipient_email);