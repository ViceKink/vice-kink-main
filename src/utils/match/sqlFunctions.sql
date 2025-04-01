
-- Function to get profiles who liked a specific user
CREATE OR REPLACE FUNCTION public.get_profiles_who_liked_me(target_user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  age INTEGER,
  location TEXT,
  avatar TEXT,
  verified BOOLEAN,
  interaction_type TEXT,
  is_matched BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.age,
    p.location,
    p.avatar,
    p.verified,
    pi.interaction_type,
    EXISTS (
      SELECT 1 FROM matches m 
      WHERE (m.user_id_1 = p.id AND m.user_id_2 = target_user_id) OR 
            (m.user_id_1 = target_user_id AND m.user_id_2 = p.id)
    ) AS is_matched
  FROM 
    profile_interactions pi
    JOIN profiles p ON pi.user_id = p.id
  WHERE 
    pi.target_profile_id = target_user_id
    AND pi.interaction_type IN ('like', 'superlike');
END;
$$;
