
-- Instead of using CREATE BUCKET syntax, insert directly into storage.buckets table
INSERT INTO storage.buckets (id, name, public)
VALUES ('message', 'message', true)
ON CONFLICT (id) DO NOTHING; -- This prevents errors if the bucket already exists

-- Storage policy to allow public access to images in the message bucket
CREATE POLICY "Public access to message bucket" 
ON storage.objects
FOR SELECT 
USING (bucket_id = 'message');

-- Storage policy to allow authenticated uploads to message bucket
CREATE POLICY "Allow authenticated uploads to message bucket" 
ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'message' AND auth.role() = 'authenticated');

-- Storage policy to allow owners to update their objects in message bucket
CREATE POLICY "Allow owners to update their objects in message bucket" 
ON storage.objects
FOR UPDATE
USING (bucket_id = 'message' AND auth.uid()::text = owner)
WITH CHECK (bucket_id = 'message');

-- Storage policy to allow owners to delete their objects in message bucket
CREATE POLICY "Allow owners to delete their objects in message bucket" 
ON storage.objects
FOR DELETE
USING (bucket_id = 'message' AND auth.uid()::text = owner);
