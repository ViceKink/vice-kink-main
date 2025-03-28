
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
      .eq('interaction_type', 'like')
      .maybeSingle();
      
    if (userLikedError) throw userLikedError;
    
    // Check if target user liked current user
    const { data: targetLiked, error: targetLikedError } = await supabase
      .from('profile_interactions')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('target_profile_id', currentUserId)
      .eq('interaction_type', 'like')
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
    const { error } = await supabase
      .from('matches')
      .insert({
        user_id_1: currentUserId < targetUserId ? currentUserId : targetUserId,
        user_id_2: currentUserId < targetUserId ? targetUserId : currentUserId,
        matched_at: new Date().toISOString()
      });
      
    if (error) throw error;
    
    toast.success("It's a match! 🎉");
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
      .from('matches')
      .select('*, profiles_1:profiles!matches_user_id_1_fkey(*), profiles_2:profiles!matches_user_id_2_fkey(*)')
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);
      
    if (error) throw error;
    
    if (!data) return [];
    
    // Format the match data to always return the OTHER user's profile
    return data.map(match => {
      const otherUserId = match.user_id_1 === userId ? match.user_id_2 : match.user_id_1;
      const otherUserProfile = match.user_id_1 === userId ? match.profiles_2 : match.profiles_1;
      
      return {
        match_id: match.id,
        matched_at: match.matched_at,
        other_user_id: otherUserId,
        other_user: otherUserProfile
      };
    });
  } catch (error) {
    console.error('Error getting user matches:', error);
    return [];
  }
};
