
-- Create a storage bucket for message images in Supabase UI
-- Go to Storage > New Bucket
-- Name: message
-- Public bucket: No
-- File size limit: 5MB
-- Allowed mime types: image/*

-- Then create a policy to allow authenticated users to upload to their own folder
-- Replace with Supabase UI steps:
-- 1. Go to Storage > message > Policies
-- 2. Create a new policy:
--    - Policy name: Allow users to upload their own images
--    - Allowed operation: INSERT
--    - Policy definition: (bucket_id = 'message' AND auth.uid()::text = (storage.foldername)[1])
-- 3. Create another policy:
--    - Policy name: Allow users to view images
--    - Allowed operation: SELECT
--    - Policy definition: bucket_id = 'message'
