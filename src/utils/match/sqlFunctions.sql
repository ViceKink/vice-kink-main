
-- Function to get profiles who liked a specific user
CREATE OR REPLACE FUNCTION public.get_profiles_who_liked_me(target_user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  age INTEGER,
  location TEXT,
  avatar TEXT,
  verified BOOLEAN,
  interaction_type TEXT
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
    pi.interaction_type
  FROM 
    profile_interactions pi
    JOIN profiles p ON pi.user_id = p.id
  WHERE 
    pi.target_profile_id = target_user_id
    AND pi.interaction_type IN ('like', 'superlike');
END;
$$;
