
import { supabase } from "@/integrations/supabase/client";
import { InteractionResult, InteractionType } from "./types";
import { checkIfMatched, createMatch } from "./matchingService";

/**
 * Creates an interaction between users (like, dislike, superlike)
 */
export const createInteraction = async (
  userId: string, 
  targetProfileId: string, 
  interactionType: InteractionType
): Promise<InteractionResult> => {
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
        const profileData = interaction.profiles;
        if (profileData && typeof profileData === 'object' && 'id' in profileData) {
          return {
            id: profileData.id || '',
            name: profileData.name || 'Unknown',
            age: profileData.age || 0,
            location: profileData.location || '',
            occupation: profileData.occupation || '',
            religion: profileData.religion || '',
            height: profileData.height || '',
            verified: profileData.verified || false,
            avatar: profileData.avatar || '',
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
