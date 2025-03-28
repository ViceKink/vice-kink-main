
import { supabase } from "@/integrations/supabase/client";
import { InteractionType, InteractionResult, DiscoverProfile } from "./types";
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
export const getLikedByProfiles = async (userId: string) => {
  if (!userId) return [];
  
  try {
    const { data, error } = await supabase
      .rpc('get_liked_by_profiles', {
        current_user_id: userId
      });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting liked-by profiles:', error);
    return [];
  }
};
