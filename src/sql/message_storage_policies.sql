
-- First, ensure the message bucket exists and is properly configured
-- Note: CREATE BUCKET syntax might not work in all Supabase instances
-- Consider using the INSERT approach from message_storage_policies_fixed.sql instead

-- Storage policy to allow public access to images in the message bucket
CREATE POLICY "Public access to message bucket" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'message');

-- Storage policy to allow authenticated uploads to message bucket
CREATE POLICY "Auth uploads to message bucket" ON storage.objects
  FOR INSERT 
  WITH CHECK (bucket_id = 'message' AND auth.role() = 'authenticated');

-- Storage policy to allow owners to update their objects in message bucket
CREATE POLICY "Owner update message objects" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'message' AND owner = auth.uid()::text)
  WITH CHECK (bucket_id = 'message');

-- Storage policy to allow owners to delete their objects in message bucket
CREATE POLICY "Owner delete message objects" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'message' AND owner = auth.uid()::text);
