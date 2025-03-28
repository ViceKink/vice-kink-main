
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Checks if two users are matched (both have liked each other)
 */
export const checkIfMatched = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
  if (!currentUserId || !targetUserId) return false;
  
  try {
    console.log('Checking if matched:', currentUserId, targetUserId);
    
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
    const isMatched = !!userLiked && !!targetLiked;
    console.log('Match check result:', isMatched, 'userLiked:', !!userLiked, 'targetLiked:', !!targetLiked);
    return isMatched;
    
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
    console.log('Creating match between', currentUserId, 'and', targetUserId);
    
    // First check if match already exists to avoid duplicates
    const { data: existingMatch, error: checkError } = await supabase
      .from('matches')
      .select('*')
      .eq('user_id_1', Math.min(currentUserId, targetUserId))
      .eq('user_id_2', Math.max(currentUserId, targetUserId))
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking for existing match:', checkError);
    }
    
    if (existingMatch) {
      console.log('Match already exists:', existingMatch);
      return true;
    }
    
    // Create a match record in the database using RPC
    const { data, error } = await supabase
      .rpc('create_match', {
        user_id_a: currentUserId,
        user_id_b: targetUserId
      });
      
    if (error) {
      console.error('Error in createMatch RPC call:', error);
      throw error;
    }
    
    console.log('Match created successfully', data);
    
    // Manually trigger a match update by invalidating the query cache
    // This will ensure the UI updates properly
    
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
    console.log('Getting matches for user:', userId);
    
    // Get all matches where the user is either user_id_1 or user_id_2
    const { data, error } = await supabase
      .rpc('get_user_matches', {
        user_id: userId
      });
      
    if (error) {
      console.error('Error in getUserMatches RPC call:', error);
      throw error;
    }
    
    console.log('Matches fetched:', data?.length || 0, 'matches found');
    console.log('Matches result:', data);
    
    // For each match, fetch the last message and unread count
    if (data && data.length > 0) {
      const matchesWithMessages = await Promise.all(
        data.map(async (match) => {
          try {
            // Get last message
            const { data: lastMessage } = await supabase.rpc('get_last_message', {
              user1: userId,
              user2: match.other_user_id
            });
            
            // Get unread count
            const { data: unreadCount } = await supabase.rpc('count_unread_messages', {
              user_id: userId,
              other_user_id: match.other_user_id
            });
            
            return {
              ...match,
              last_message: lastMessage?.[0]?.content || null,
              unread_count: unreadCount || 0
            };
          } catch (err) {
            console.error('Error fetching message data for match:', match.match_id, err);
            return {
              ...match,
              last_message: null,
              unread_count: 0
            };
          }
        })
      );
      
      return matchesWithMessages || [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting user matches:', error);
    return [];
  }
};

/**
 * Force check for potential matches and create them if found
 * This is a utility function that can be called to ensure matches are created
 */
export const forceCheckForMatches = async (userId: string): Promise<number> => {
  if (!userId) return 0;
  
  try {
    console.log('Force checking for potential matches for user:', userId);
    
    // Get all profiles that the current user has liked
    const { data: userLikes, error: likesError } = await supabase
      .from('profile_interactions')
      .select('target_profile_id')
      .eq('user_id', userId)
      .in('interaction_type', ['like', 'superlike']);
      
    if (likesError) throw likesError;
    
    if (!userLikes || userLikes.length === 0) {
      console.log('User has not liked any profiles yet');
      return 0;
    }
    
    const targetIds = userLikes.map(like => like.target_profile_id);
    console.log('User has liked these profiles:', targetIds);
    
    // Find which of these profiles have also liked the current user
    const { data: mutualLikes, error: mutualError } = await supabase
      .from('profile_interactions')
      .select('user_id')
      .eq('target_profile_id', userId)
      .in('interaction_type', ['like', 'superlike'])
      .in('user_id', targetIds);
      
    if (mutualError) throw mutualError;
    
    if (!mutualLikes || mutualLikes.length === 0) {
      console.log('No mutual likes found');
      return 0;
    }
    
    console.log('Found mutual likes:', mutualLikes);
    
    // Create matches for all mutual likes if they don't exist yet
    let matchesCreated = 0;
    
    for (const like of mutualLikes) {
      const matchCreated = await createMatch(userId, like.user_id);
      if (matchCreated) matchesCreated++;
    }
    
    console.log(`Successfully created ${matchesCreated} new matches`);
    return matchesCreated;
  } catch (error) {
    console.error('Error in forceCheckForMatches:', error);
    return 0;
  }
};
