
# Setting up Image Messaging

For the image messaging feature to work properly, you need to:

## 1. Creating the Storage Bucket

There are two ways to create a bucket in Supabase:

### Option 1: Using the SQL Editor
Run the following SQL in the Supabase SQL Editor:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('message', 'message', true)
ON CONFLICT (id) DO NOTHING;
```

### Option 2: Using the Supabase Dashboard
Create a storage bucket in Supabase:
   - Go to Storage in the Supabase Dashboard
   - Click "New Bucket"
   - Name it "message" (case sensitive) - Make sure it's exactly "message", not "messages"
   - Set public access to "true"
   - Set file size limit to 5MB
   - Set allowed mime types to "image/*"
   - Click "Create bucket"

## 2. Setting up Storage Policies

Run the following SQL script in the Supabase SQL Editor to set up the necessary storage policies:

```sql
-- Storage policy to allow public access to images in the message bucket
CREATE POLICY "Public access to message bucket" 
ON storage.objects
FOR SELECT 
USING (bucket_id = 'message');

-- Storage policy to allow authenticated uploads to message bucket
CREATE POLICY "Auth uploads to message bucket" 
ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'message' AND auth.role() = 'authenticated');

-- Storage policy to allow owners to update their objects in message bucket
CREATE POLICY "Owner update message objects" 
ON storage.objects
FOR UPDATE
USING (bucket_id = 'message' AND owner = auth.uid()::text)
WITH CHECK (bucket_id = 'message');

-- Storage policy to allow owners to delete their objects in message bucket
CREATE POLICY "Owner delete message objects" 
ON storage.objects
FOR DELETE
USING (bucket_id = 'message' AND owner = auth.uid()::text);
```

## 3. Troubleshooting

If you're having any issues:

### Checking Bucket Configuration
1. Go to the Storage section in Supabase
2. Verify that a bucket named "message" exists (not "messages")
3. Check that it's set to public
4. Verify storage policies allow public access

### Image URL Issues
If images upload but don't display:
1. Check your browser console for URL-related errors
2. Verify that the URL format is correct - it should be:
   `https://<your-project-reference>.supabase.co/storage/v1/object/public/message/<filepath>`
3. Make sure the file path in the URL is correct

### "Bucket not found" Error
If you see "Bucket not found" errors:
1. Make sure the bucket name is exactly "message" (not "messages" or any other variation)
2. Try creating the bucket through the Supabase dashboard
3. Run the SQL policies again after creating the bucket
4. Check if the Supabase project reference in the URL matches your current project

### Authentication Issues
If you're getting authentication errors:
1. Make sure you're logged in
2. Verify that the storage policies allow authenticated uploads
3. Check that the auth.role() and auth.uid() functions are working correctly

### Message Function Configuration
Make sure your message function is properly configured:
1. Run any SQL script for message functions if provided
2. Check that your messages table has the required columns for images
