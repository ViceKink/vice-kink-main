
-- First, ensure the messages bucket exists and is properly configured
CREATE BUCKET IF NOT EXISTS "messages" WITH (public = true);

-- Storage policy to allow public access to images in the messages bucket
CREATE POLICY "Public access to messages bucket" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'messages');

-- Storage policy to allow authenticated uploads to messages bucket
CREATE POLICY "Allow authenticated uploads to messages bucket" ON storage.objects
  FOR INSERT 
  WITH CHECK (bucket_id = 'messages' AND auth.role() = 'authenticated');

-- Storage policy to allow owners to update their objects in messages bucket
CREATE POLICY "Allow owners to update their objects in messages bucket" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'messages' AND auth.uid() = owner)
  WITH CHECK (bucket_id = 'messages');

-- Storage policy to allow owners to delete their objects in messages bucket
CREATE POLICY "Allow owners to delete their objects in messages bucket" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'messages' AND auth.uid() = owner);
