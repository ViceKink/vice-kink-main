
-- Storage policy to allow users to upload images to their own folders
CREATE POLICY "Allow users to upload their own images" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'messages' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policy to allow users to view images
CREATE POLICY "Allow users to view images" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'messages');
