
# Setting up Image Messaging

For the image messaging feature to work properly, you need to:

1. Create a storage bucket in Supabase:
   - Go to Storage in the Supabase Dashboard
   - Click "New Bucket"
   - Name it "messages"
   - Uncheck "Public bucket" (we'll control access with policies)
   - Set file size limit to 5MB
   - Set allowed mime types to "image/*"
   - Click "Create bucket"

2. Run the SQL script in `src/sql/message_storage_policies.sql` in the Supabase SQL Editor to set up the necessary storage policies.

This will allow users to upload and view images in their messages.
