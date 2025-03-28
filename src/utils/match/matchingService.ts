
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Checks if two users are matched (both have liked each other)
 */
export const checkIfMatched = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
  if (!currentUserId || !targetUserId) return false;
  
  try {
    // Check if current user liked target user
    const { data: userLiked, error: userLikedError } = await supabase
      .from('profile_interactions')
      .select('*')
      .eq('user_id', currentUserId)
      .eq('target_profile_id', targetUserId)
      .in('interaction_type', ['like', 'superlike'])
      .maybeSingle();
      
    if (userLikedError) throw userLikedError;
    
    // Check if target user liked current user
    const { data: targetLiked, error: targetLikedError } = await supabase
      .from('profile_interactions')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('target_profile_id', currentUserId)
      .in('interaction_type', ['like', 'superlike'])
      .maybeSingle();
      
    if (targetLikedError) throw targetLikedError;
    
    // Match exists if both users liked each other
    return !!userLiked && !!targetLiked;
    
  } catch (error) {
    console.error('Error checking match:', error);
    return false;
  }
};

/**
 * Creates a match between two users
 */
export const createMatch = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
  if (!currentUserId || !targetUserId) return false;
  
  try {
    // Create a match record in the database
    const { data, error } = await supabase
      .rpc('create_match', {
        user_id_a: currentUserId,
        user_id_b: targetUserId
      });
      
    if (error) throw error;
    
    // We don't show a toast here since we'll show a match animation instead
    return true;
  } catch (error) {
    console.error('Error creating match:', error);
    toast.error("Couldn't create match");
    return false;
  }
};

/**
 * Get all matches for a user
 */
export const getUserMatches = async (userId: string) => {
  if (!userId) return [];
  
  try {
    // Get all matches where the user is either user_id_1 or user_id_2
    const { data, error } = await supabase
      .rpc('get_user_matches', {
        user_id: userId
      });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting user matches:', error);
    return [];
  }
};
