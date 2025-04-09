
# Setting up Image Messaging

For the image messaging feature to work properly, you need to:

## 1. Creating the Storage Bucket

Create a storage bucket in Supabase:
   - Go to Storage in the Supabase Dashboard
   - Click "New Bucket"
   - Name it "messages" (case sensitive) - Make sure it's exactly "messages", not "message"
   - Set public access to "true"
   - Set file size limit to 5MB
   - Set allowed mime types to "image/*"
   - Click "Create bucket"

## 2. Setting up Storage Policies

Run the SQL script in `src/sql/message_storage_policies.sql` in the Supabase SQL Editor to set up the necessary storage policies:

```sql
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
```

## 3. Troubleshooting

If you're having any issues:

### Checking Bucket Configuration
1. Go to the Storage section in Supabase
2. Verify that a bucket named "messages" exists (not "message")
3. Check that it's set to public
4. Verify storage policies allow public access

### Image URL Issues
If images upload but don't display:
1. Check your browser console for URL-related errors
2. Verify that the URL format is correct - it should be:
   `https://<your-project-reference>.supabase.co/storage/v1/object/public/messages/<filepath>`
3. Make sure the file path in the URL is correct

### "Bucket not found" Error
If you see "Bucket not found" errors:
1. Make sure the bucket name is exactly "messages" (not "message" or any other variation)
2. Try recreating the bucket through the Supabase dashboard
3. Run the SQL policies again from `src/sql/message_storage_policies.sql`
4. Check if the Supabase project reference in the URL matches your current project

### Authentication Issues
If you're getting authentication errors:
1. Make sure you're logged in
2. Verify that the storage policies allow authenticated uploads
3. Check that the auth.role() and auth.uid() functions are working correctly

### Message Function Configuration
Make sure your message function is properly configured:
1. Run the SQL script in `src/sql/message_with_image_function.sql`
2. Check that your messages table has the required columns for images

## Alternative Solutions

If you continue to have issues with Supabase Storage:

1. **Use Base64 Encoding**: You can encode small images as base64 strings and store them directly in the messages table
2. **Use External Image Hosting**: Services like Cloudinary or Imgur can be used as alternatives
3. **Implement Fallback Mode**: The current implementation will gracefully handle image upload failures by sending text-only messages
