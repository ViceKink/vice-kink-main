import { supabase } from '@/integrations/supabase/client';

async function getLikesForUser(userId: string) {
  // Get profiles that have liked the current user but aren't matched yet
  try {
    const { data, error } = await supabase
      .rpc('get_profiles_who_liked_me', { target_user_id: userId });

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
        user_id_a: currentUserId,
        user_id_b: likedUserId,
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
    // First check if there's a potential match
    const { data: potentialMatch, error: matchCheckError } = await supabase
      .from('profile_interactions')
      .select('*')
      .eq('user_id', likedProfileId)
      .eq('target_profile_id', currentUserId)
      .eq('interaction_type', 'like')
      .single();

    if (matchCheckError && matchCheckError.code !== 'PGRST116') {
      throw matchCheckError;
    }

    // Insert the like interaction
    const { data, error } = await supabase
      .from('profile_interactions')
      .insert({
        user_id: currentUserId,
        target_profile_id: likedProfileId,
        interaction_type: 'like',
      })
      .select();

    if (error) throw error;

    return { 
      interaction: data[0],
      isMatch: !!potentialMatch
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
    // First check if there's a potential match
    const { data: potentialMatch, error: matchCheckError } = await supabase
      .from('profile_interactions')
      .select('*')
      .eq('user_id', likedProfileId)
      .eq('target_profile_id', currentUserId)
      .eq('interaction_type', 'like')
      .single();

    if (matchCheckError && matchCheckError.code !== 'PGRST116') {
      throw matchCheckError;
    }

    // Insert the superlike interaction
    const { data, error } = await supabase
      .from('profile_interactions')
      .insert({
        user_id: currentUserId,
        target_profile_id: likedProfileId,
        interaction_type: 'superlike',
      })
      .select();

    if (error) throw error;

    return { 
      interaction: data[0],
      isMatch: !!potentialMatch
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
        target_profile_id: rejectedProfileId,
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
async function revealProfile(profileId: string) {
  try {
    // Get the user session correctly
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    
    if (!session?.user) {
      throw new Error('Not authenticated');
    }
    
    const userId = session.user.id;

    // Update the interaction to mark it as revealed
    const { data, error } = await supabase
      .from('profile_interactions')
      .update({ is_revealed: true })
      .eq('user_id', profileId)  // The liker's ID
      .eq('target_profile_id', userId)  // The current user's ID
      .select();

    if (error) {
      console.error('Error in revealProfile:', error);
      throw error;
    }
    
    // Log the response to help debug
    console.log('Profile reveal response:', data);
    
    return data;
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
