
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
 * Creates an interaction between users (like, dislike, superlike)
 */
export const createInteraction = async (
  userId: string, 
  targetProfileId: string, 
  interactionType: 'like' | 'dislike' | 'superlike'
): Promise<{success: boolean, matched: boolean}> => {
  if (!userId || !targetProfileId) return {success: false, matched: false};
  
  try {
    const { error } = await supabase
      .from('profile_interactions')
      .insert({
        user_id: userId,
        target_profile_id: targetProfileId,
        interaction_type: interactionType
      });
      
    if (error) throw error;
    
    // Check for match if interaction is a like or superlike
    if (interactionType === 'like' || interactionType === 'superlike') {
      const isMatched = await checkIfMatched(userId, targetProfileId);
      if (isMatched) {
        await createMatch(userId, targetProfileId);
        return {success: true, matched: true};
      }
    }
    
    return {success: true, matched: false};
  } catch (error) {
    console.error(`Error creating ${interactionType} interaction:`, error);
    return {success: false, matched: false};
  }
};

/**
 * Get all interactions for a user
 */
export const getUserInteractions = async (userId: string) => {
  if (!userId) return [];
  
  try {
    const { data, error } = await supabase
      .from('profile_interactions')
      .select('target_profile_id, interaction_type')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting user interactions:', error);
    return [];
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

/**
 * Get profiles who have liked/superliked the current user, but there's no match yet
 */
export const getProfilesWhoLikedMe = async (userId: string) => {
  if (!userId) return [];
  
  try {
    // Get all profiles who liked the current user
    const { data, error } = await supabase
      .from('profile_interactions')
      .select(`
        user_id,
        interaction_type,
        profiles!profile_interactions_user_id_fkey (
          id,
          name,
          age,
          location,
          occupation,
          religion,
          height,
          verified,
          avatar
        )
      `)
      .eq('target_profile_id', userId)
      .in('interaction_type', ['like', 'superlike']);
      
    if (error) throw error;
    
    // Filter out users who already have a match with current user
    const filteredLikers = await Promise.all(
      data.map(async (interaction) => {
        const isMatched = await checkIfMatched(userId, interaction.user_id);
        return {
          ...interaction,
          alreadyMatched: isMatched
        };
      })
    );
    
    // Only include profiles that don't already have a match
    const profilesWhoLikedMe = filteredLikers
      .filter(interaction => !interaction.alreadyMatched)
      .map(interaction => {
        // Type safety check
        const profile = interaction.profiles;
        if (profile) {
          return {
            id: profile.id,
            name: profile.name,
            age: profile.age,
            location: profile.location,
            occupation: profile.occupation,
            religion: profile.religion,
            height: profile.height,
            verified: profile.verified,
            avatar: profile.avatar,
            interaction_type: interaction.interaction_type
          };
        }
        return null;
      })
      .filter(profile => profile !== null); // Filter out any null values
    
    return profilesWhoLikedMe;
  } catch (error) {
    console.error('Error getting profiles who liked me:', error);
    return [];
  }
};
