
-- Function to send a message with optional image
CREATE OR REPLACE FUNCTION public.send_message(
  sender UUID, 
  receiver UUID, 
  message_content TEXT,
  image_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  message_id UUID;
BEGIN
  INSERT INTO public.messages (sender_id, receiver_id, content, image_url, is_image_revealed)
  VALUES (
    sender, 
    receiver, 
    message_content, 
    image_url,
    -- Images are auto-revealed for the sender, but not for the receiver unless sender == receiver
    CASE WHEN image_url IS NOT NULL THEN (sender = receiver) ELSE NULL END
  )
  RETURNING id INTO message_id;
  
  RETURN message_id;
END;
$$;

-- Make sure the messages table has the right columns
-- If using Supabase, run this in the SQL editor:
ALTER TABLE IF EXISTS public.messages 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS is_image_revealed BOOLEAN DEFAULT false;
