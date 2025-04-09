
# Setting up Image Messaging

For the image messaging feature to work properly, you need to:

1. Create a storage bucket in Supabase:
   - Go to Storage in the Supabase Dashboard
   - Click "New Bucket"
   - Name it "messages" (case sensitive) - Make sure it's exactly "messages", not "message"
   - Set public access to "true"
   - Set file size limit to 5MB
   - Set allowed mime types to "image/*"
   - Click "Create bucket"

2. Run the SQL script in `src/sql/message_storage_policies.sql` in the Supabase SQL Editor to set up the necessary storage policies.
   - This will ensure the bucket exists and has the proper permissions

3. If you're having any issues:
   - Check your browser's developer console for detailed error messages
   - Make sure the bucket name and policies match exactly
   - Verify your Supabase credentials and permissions

## Alternative Approach

If you continue to have issues with Supabase Storage:

1. You can use an external image hosting service like Imgur or Cloudinary
2. Implement a fallback that allows text-only messages when image upload fails
3. The current implementation will gracefully handle image upload failures by sending text-only messages

## Troubleshooting

If you're still seeing a "Bucket not found" error:
1. Make sure the bucket name in the code matches exactly the one in Supabase (should be "messages")
2. Verify that your Supabase client has the correct credentials and URL
3. Check for any network issues or CORS problems in your browser developer tools
4. Try running the SQL script again to ensure the bucket exists
