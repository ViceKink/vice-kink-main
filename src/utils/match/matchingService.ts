
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
    console.log('Creating match between', currentUserId, 'and', targetUserId);
    
    // Create a match record in the database
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
