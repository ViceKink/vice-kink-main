
# Setting up Image Messaging

For the image messaging feature to work properly, you need to:

1. Create a storage bucket in Supabase:
   - Go to Storage in the Supabase Dashboard
   - Click "New Bucket"
   - Name it "messages" (case sensitive)
   - For testing, check "Public bucket" (we'll control access with policies later)
   - Set file size limit to 5MB
   - Set allowed mime types to "image/*"
   - Click "Create bucket"

2. Run the SQL script in `src/sql/message_storage_policies.sql` in the Supabase SQL Editor to set up the necessary storage policies.

3. Make sure to run the SQL in `src/sql/message_with_image_function.sql` to update the database tables and functions.

This will allow users to upload and view images in their messages. For debugging, you can check the browser console for detailed logs of the upload process.

## Troubleshooting

If you're seeing a "Bucket not found" error:
1. Verify the bucket name is exactly "messages" (case sensitive)
2. Check that your storage policies are correctly applied
3. Make sure your Supabase client has the correct credentials
