
CREATE OR REPLACE FUNCTION public.get_user_matches(user_id UUID) RETURNS TABLE (match_id UUID, matched_at TIMESTAMPTZ, other_user_id UUID, other_user JSON) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN RETURN QUERY
  SELECT m.id, m.matched_at,
    CASE WHEN m.user_id_1 = user_id THEN m.user_id_2 ELSE m.user_id_1 END,
    CASE WHEN m.user_id_1 = user_id THEN json_build_object('id', p2.id, 'name', p2.name, 'avatar', p2.avatar)
    ELSE json_build_object('id', p1.id, 'name', p1.name, 'avatar', p1.avatar) END
  FROM public.matches m
  JOIN public.profiles p1 ON m.user_id_1 = p1.id
  JOIN public.profiles p2 ON m.user_id_2 = p2.id
  WHERE m.user_id_1 = user_id OR m.user_id_2 = user_id
  ORDER BY m.matched_at DESC;
END; $$;

CREATE OR REPLACE FUNCTION public.get_conversation(user1 UUID, user2 UUID) RETURNS TABLE (id UUID, sender_id UUID, receiver_id UUID, content TEXT, created_at TIMESTAMPTZ, read BOOLEAN, image_url TEXT) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN RETURN QUERY
  SELECT m.* FROM public.messages m
  WHERE (m.sender_id = user1 AND m.receiver_id = user2) OR (m.sender_id = user2 AND m.receiver_id = user1)
  ORDER BY m.created_at ASC;
END; $$;

CREATE OR REPLACE FUNCTION public.mark_messages_as_read(user_id UUID, other_user_id UUID) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.messages SET read = true
  WHERE receiver_id = user_id AND sender_id = other_user_id AND read = false;
END; $$;
