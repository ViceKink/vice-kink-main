
-- First, ensure the message bucket exists and is properly configured
CREATE BUCKET IF NOT EXISTS "message" WITH (public = true);

-- Storage policy to allow public access to images in the message bucket
CREATE POLICY "Public access to message bucket" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'message');

-- Storage policy to allow authenticated uploads to message bucket
CREATE POLICY "Allow authenticated uploads to message bucket" ON storage.objects
  FOR INSERT 
  WITH CHECK (bucket_id = 'message' AND auth.role() = 'authenticated');

-- Storage policy to allow owners to update their objects in message bucket
CREATE POLICY "Allow owners to update their objects in message bucket" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'message' AND auth.uid()::text = owner)
  WITH CHECK (bucket_id = 'message');

-- Storage policy to allow owners to delete their objects in message bucket
CREATE POLICY "Allow owners to delete their objects in message bucket" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'message' AND auth.uid()::text = owner);
