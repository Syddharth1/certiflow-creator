-- Add verification_id to certificates table
ALTER TABLE public.certificates 
ADD COLUMN verification_id TEXT UNIQUE;

-- Update existing certificates with verification IDs
UPDATE public.certificates 
SET verification_id = 'CERT-' || UPPER(SUBSTRING(id::text FROM 1 FOR 8))
WHERE verification_id IS NULL;

-- Make verification_id not null after populating existing records
ALTER TABLE public.certificates 
ALTER COLUMN verification_id SET NOT NULL;

-- Create index for faster verification lookups
CREATE INDEX idx_certificates_verification_id ON public.certificates(verification_id);

-- Create a policy to allow public access to certificates for verification
CREATE POLICY "Public can verify certificates" 
ON public.certificates 
FOR SELECT 
USING (true);