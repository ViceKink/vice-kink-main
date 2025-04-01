
import { supabase } from "@/integrations/supabase/client";
import { InteractionType, InteractionResult } from "./types";
import { toast } from "sonner";
import { createMatch, checkIfMatched } from "./matchingService";
import { Profile } from "@/models/profileTypes";

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
    console.log('Creating interaction:', userId, '->', targetProfileId, ':', interactionType);
    
    // First, check if the interaction already exists to avoid duplicates
    const { data: existingInteraction, error: checkError } = await supabase
      .from('profile_interactions')
      .select('*')
      .eq('user_id', userId)
      .eq('target_profile_id', targetProfileId)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking for existing interaction:', checkError);
    }
    
    if (existingInteraction) {
      console.log('Existing interaction found:', existingInteraction);
      // If interaction already exists, update it
      const { error: updateError } = await supabase
        .from('profile_interactions')
        .update({ interaction_type: interactionType })
        .eq('id', existingInteraction.id);
        
      if (updateError) {
        console.error('Error updating interaction:', updateError);
        throw updateError;
      }
    } else {
      // Create new interaction
      const { error: insertError } = await supabase
        .from('profile_interactions')
        .insert({
          user_id: userId,
          target_profile_id: targetProfileId,
          interaction_type: interactionType
        });
        
      if (insertError) {
        console.error('Error creating interaction:', insertError);
        throw insertError;
      }
    }
    
    // If it's a like or superlike, check if there's a match
    if (interactionType === 'like' || interactionType === 'superlike') {
      console.log('Checking for match after like/superlike');
      const isMatched = await checkIfMatched(userId, targetProfileId);
      
      if (isMatched) {
        console.log('Match found! Creating match in database');
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
    console.log('Getting interactions for user:', userId);
    const { data, error } = await supabase
      .from('profile_interactions')
      .select('*')
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error getting user interactions:', error);
      throw error;
    }
    
    console.log('Interactions fetched:', data?.length || 0, 'interactions found');
    return data || [];
  } catch (error) {
    console.error('Error getting user interactions:', error);
    return [];
  }
};

/**
 * Get profiles that have liked the current user
 */
export const getProfilesWhoLikedMe = async (userId: string): Promise<Profile[]> => {
  if (!userId) return [];
  
  try {
    console.log('Getting profiles who liked user:', userId);
    
    // Use a direct SQL query through RPC to avoid relationship issues
    const { data, error } = await supabase.rpc<{
      id: string;
      name: string;
      age: number;
      location: string;
      avatar: string;
      verified: boolean;
      interaction_type: string;
    }[]>('get_profiles_who_liked_me', {
      target_user_id: userId
    });
    
    if (error) {
      console.error('Error fetching profiles who liked me:', error);
      throw error;
    }
    
    console.log('Raw profiles who liked data:', data);
    
    if (!data || data.length === 0) {
      console.log('No profiles found who liked user:', userId);
      return [];
    }
    
    // Transform the data to match the Profile interface
    const profiles = data.map(profile => ({
      id: profile.id,
      name: profile.name || 'Unknown User',
      age: profile.age || 0,
      location: profile.location || '',
      avatar: profile.avatar || '',
      photos: [], // Required by Profile interface
      verified: profile.verified || false,
      interactionType: profile.interaction_type as 'like' | 'superlike'
    }));
    
    console.log('Transformed profiles who liked me:', profiles);
    return profiles;
  } catch (error) {
    console.error('Error getting profiles who liked me:', error);
    return [];
  }
};
