-- Create elements table for admin-uploaded design elements
CREATE TABLE public.elements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  image_url TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.elements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view active elements" 
ON public.elements 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage all elements" 
ON public.elements 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for element images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('elements', 'elements', true);

-- Create storage policies for element uploads
CREATE POLICY "Anyone can view element images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'elements');

CREATE POLICY "Admins can upload element images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'elements' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update element images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'elements' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete element images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'elements' AND has_role(auth.uid(), 'admin'::app_role));