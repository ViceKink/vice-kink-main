
-- Storage policy to allow users to upload their own images
CREATE POLICY "Allow users to upload their own images" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'messages'
  );

-- Storage policy to allow users to view images
CREATE POLICY "Allow users to view images" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'messages');

-- Storage policy to allow users to update their own images
CREATE POLICY "Allow users to update their own images" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'messages')
  WITH CHECK (bucket_id = 'messages');

-- Storage policy to allow users to delete their own images
CREATE POLICY "Allow users to delete their own images" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'messages');
