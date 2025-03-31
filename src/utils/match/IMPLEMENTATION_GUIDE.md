
# Likes Feature Implementation Guide

To make the "who liked me" feature work properly, follow these steps:

1. Run this SQL function in the Supabase SQL Editor:

```sql
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
```

2. Run the code to see likes in the application.

3. If issues persist:
   - Verify profile_interactions table has correct data
   - Check if user IDs are correct
   - Confirm both profiles and interactions tables have the required fields
