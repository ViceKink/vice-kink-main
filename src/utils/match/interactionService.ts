
import { supabase } from '@/integrations/supabase/client';
import { ProfileWithInteraction } from '@/utils/match/types';

async function getLikesForUser(userId: string): Promise<ProfileWithInteraction[]> {
  // Get profiles that have liked the current user but aren't matched yet
  try {
    const { data, error } = await supabase
      .rpc('get_profiles_that_liked_me', { user_id: userId });

    if (error) {
      console.error('Error getting user likes:', error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getLikesForUser:', error);
    throw error;
  }
}

// Function to create a match between two users
async function createMatch(currentUserId: string, likedUserId: string) {
  if (!currentUserId || !likedUserId) {
    throw new Error('Both user IDs are required to create a match');
  }

  try {
    const { data, error } = await supabase
      .rpc('create_match', {
        user1_id: currentUserId,
        user2_id: likedUserId,
      });

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error in createMatch:', error);
    throw error;
  }
}

// Function to get all matches for the current user
async function getMatches(userId: string) {
  try {
    const { data, error } = await supabase
      .rpc('get_user_matches', { user_id: userId });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error in getMatches:', error);
    throw error;
  }
}

// Function to like a profile
async function likeProfile(currentUserId: string, likedProfileId: string) {
  if (!currentUserId || !likedProfileId) {
    throw new Error('Both user IDs are required');
  }

  try {
    // First check if this would create a match
    const { data: matchData, error: matchError } = await supabase
      .rpc('check_for_potential_match', {
        user1_id: currentUserId,
        user2_id: likedProfileId,
      });

    if (matchError) throw matchError;

    // Insert the like interaction
    const { data, error } = await supabase
      .from('profile_interactions')
      .insert({
        user_id: currentUserId,
        target_user_id: likedProfileId,
        interaction_type: 'like',
      })
      .select();

    if (error) throw error;

    return { 
      interaction: data[0],
      isMatch: matchData?.is_match || false
    };
  } catch (error) {
    console.error('Error in likeProfile:', error);
    throw error;
  }
}

// Function to super like a profile
async function superlikeProfile(currentUserId: string, likedProfileId: string) {
  if (!currentUserId || !likedProfileId) {
    throw new Error('Both user IDs are required');
  }

  try {
    // First check if this would create a match
    const { data: matchData, error: matchError } = await supabase
      .rpc('check_for_potential_match', {
        user1_id: currentUserId,
        user2_id: likedProfileId,
      });

    if (matchError) throw matchError;

    // Insert the superlike interaction
    const { data, error } = await supabase
      .from('profile_interactions')
      .insert({
        user_id: currentUserId,
        target_user_id: likedProfileId,
        interaction_type: 'superlike',
      })
      .select();

    if (error) throw error;

    return { 
      interaction: data[0],
      isMatch: matchData?.is_match || false
    };
  } catch (error) {
    console.error('Error in superlikeProfile:', error);
    throw error;
  }
}

// Function to reject a profile
async function rejectProfile(currentUserId: string, rejectedProfileId: string) {
  if (!currentUserId || !rejectedProfileId) {
    throw new Error('Both user IDs are required');
  }

  try {
    const { data, error } = await supabase
      .from('profile_interactions')
      .insert({
        user_id: currentUserId,
        target_user_id: rejectedProfileId,
        interaction_type: 'reject',
      })
      .select();

    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Error in rejectProfile:', error);
    throw error;
  }
}

// Function to reveal a profile that has liked the current user
async function revealProfile(currentUserId: string, profileToRevealId: string) {
  if (!currentUserId || !profileToRevealId) {
    throw new Error('Both user IDs are required');
  }

  try {
    // Update the interaction to mark it as revealed
    const { data, error } = await supabase
      .from('profile_interactions')
      .update({ is_revealed: true })
      .eq('user_id', profileToRevealId)
      .eq('target_user_id', currentUserId)
      .select();

    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Error in revealProfile:', error);
    throw error;
  }
}

export const interactionService = {
  getLikesForUser,
  createMatch,
  getMatches,
  likeProfile,
  superlikeProfile,
  rejectProfile,
  revealProfile,
};
