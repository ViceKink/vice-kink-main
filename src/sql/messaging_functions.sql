
-- Function to create a match
CREATE OR REPLACE FUNCTION public.create_match(user_id_a UUID, user_id_b UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.matches (user_id_1, user_id_2)
  VALUES (
    LEAST(user_id_a, user_id_b),
    GREATEST(user_id_a, user_id_b)
  )
  ON CONFLICT (user_id_1, user_id_2) DO NOTHING;
END;
$$;

-- Function to get user matches with profiles
CREATE OR REPLACE FUNCTION public.get_user_matches(user_id UUID)
RETURNS TABLE (
  match_id UUID,
  matched_at TIMESTAMPTZ,
  other_user_id UUID,
  other_user JSON
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id as match_id,
    m.matched_at,
    CASE 
      WHEN m.user_id_1 = user_id THEN m.user_id_2
      ELSE m.user_id_1
    END as other_user_id,
    CASE 
      WHEN m.user_id_1 = user_id THEN 
        json_build_object(
          'id', p2.id,
          'name', p2.name,
          'avatar', p2.avatar
        )
      ELSE 
        json_build_object(
          'id', p1.id,
          'name', p1.name,
          'avatar', p1.avatar
        )
    END as other_user
  FROM 
    public.matches m
    JOIN public.profiles p1 ON m.user_id_1 = p1.id
    JOIN public.profiles p2 ON m.user_id_2 = p2.id
  WHERE 
    m.user_id_1 = user_id OR m.user_id_2 = user_id
  ORDER BY 
    m.matched_at DESC;
END;
$$;

-- Function to get the most recent message between two users
CREATE OR REPLACE FUNCTION public.get_last_message(user1 UUID, user2 UUID)
RETURNS TABLE (
  id UUID,
  sender_id UUID,
  receiver_id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  read BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT m.*
  FROM public.messages m
  WHERE 
    (m.sender_id = user1 AND m.receiver_id = user2) OR
    (m.sender_id = user2 AND m.receiver_id = user1)
  ORDER BY m.created_at DESC
  LIMIT 1;
END;
$$;

-- Function to count unread messages
CREATE OR REPLACE FUNCTION public.count_unread_messages(user_id UUID, other_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO unread_count
  FROM public.messages
  WHERE receiver_id = user_id AND sender_id = other_user_id AND read = false;
  
  RETURN unread_count;
END;
$$;

-- Function to get conversation between two users
CREATE OR REPLACE FUNCTION public.get_conversation(user1 UUID, user2 UUID)
RETURNS TABLE (
  id UUID,
  sender_id UUID,
  receiver_id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  read BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT m.*
  FROM public.messages m
  WHERE 
    (m.sender_id = user1 AND m.receiver_id = user2) OR
    (m.sender_id = user2 AND m.receiver_id = user1)
  ORDER BY m.created_at ASC;
END;
$$;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(user_id UUID, other_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.messages
  SET read = true
  WHERE 
    receiver_id = user_id AND 
    sender_id = other_user_id AND 
    read = false;
END;
$$;

-- Fix the overloaded function by removing one of the send_message functions and keeping just one version
-- Function to send a message (simpler version without image_url parameter)
CREATE OR REPLACE FUNCTION public.send_message(sender UUID, receiver UUID, message_content TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  message_id UUID;
BEGIN
  INSERT INTO public.messages (sender_id, receiver_id, content)
  VALUES (sender, receiver, message_content)
  RETURNING id INTO message_id;
  
  RETURN message_id;
END;
$$;

-- Add a new function for sending messages with images
CREATE OR REPLACE FUNCTION public.send_message_with_image(sender UUID, receiver UUID, message_content TEXT, image_url TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  message_id UUID;
BEGIN
  INSERT INTO public.messages (sender_id, receiver_id, content, image_url)
  VALUES (sender, receiver, message_content, image_url)
  RETURNING id INTO message_id;
  
  RETURN message_id;
END;
$$;
