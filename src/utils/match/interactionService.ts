
import { supabase } from "@/integrations/supabase/client";
import { InteractionType, InteractionResult } from "./types";
import { toast } from "sonner";
import { createMatch, checkIfMatched } from "./matchingService";

/**
 * Create an interaction with a profile (like, dislike, superlike)
 */
export const createInteraction = async (
  userId: string,
  targetProfileId: string,
  interactionType: InteractionType
): Promise<InteractionResult> => {
  if (!userId || !targetProfileId) {
    return { success: false, matched: false };
  }
  
  try {
    const { data, error } = await supabase
      .from('profile_interactions')
      .insert({
        user_id: userId,
        target_profile_id: targetProfileId,
        interaction_type: interactionType
      });
      
    if (error) throw error;
    
    // If it's a like or superlike, check if there's a match
    if (interactionType === 'like' || interactionType === 'superlike') {
      const isMatched = await checkIfMatched(userId, targetProfileId);
      
      if (isMatched) {
        // Create a match in the database
        await createMatch(userId, targetProfileId);
        return { success: true, matched: true };
      }
    }
    
    return { success: true, matched: false };
  } catch (error) {
    console.error('Error creating interaction:', error);
    toast.error(`Failed to ${interactionType} profile`);
    return { success: false, matched: false };
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
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting user interactions:', error);
    return [];
  }
};

/**
 * Get profiles that have liked the current user
 */
export const getProfilesWhoLikedMe = async (userId: string) => {
  if (!userId) return [];
  
  try {
    // First, get the user IDs who liked this user
    const { data: interactionsData, error: interactionsError } = await supabase
      .from('profile_interactions')
      .select('user_id, interaction_type')
      .eq('target_profile_id', userId)
      .in('interaction_type', ['like', 'superlike']);
      
    if (interactionsError) throw interactionsError;
    
    if (!interactionsData || interactionsData.length === 0) {
      return [];
    }
    
    // Get the user IDs
    const userIds = interactionsData.map(interaction => interaction.user_id);
    
    // Then fetch the profile data for those users
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, age, location, avatar')
      .in('id', userIds);
      
    if (profilesError) throw profilesError;
    
    if (!profilesData) return [];
    
    // Combine the data
    return profilesData.map(profile => {
      const interaction = interactionsData.find(i => i.user_id === profile.id);
      return {
        id: profile.id,
        name: profile.name,
        age: profile.age || 0,
        location: profile.location || '',
        avatar: profile.avatar || '',
        interactionType: interaction?.interaction_type
      };
    });
  } catch (error) {
    console.error('Error getting profiles who liked me:', error);
    return [];
  }
};
