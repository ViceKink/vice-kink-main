import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MatchWithProfile } from "@/models/matchesTypes";
import { DiscoverProfile } from "./types";

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
export const getUserMatches = async (userId: string): Promise<MatchWithProfile[]> => {
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
            
            // Parse the JSON other_user field
            const otherUser = typeof match.other_user === 'string' 
              ? JSON.parse(match.other_user)
              : match.other_user;
            
            return {
              ...match,
              other_user: {
                id: otherUser.id,
                name: otherUser.name,
                avatar: otherUser.avatar
              },
              last_message: lastMessage?.[0]?.content || null,
              unread_count: unreadCount || 0
            };
          } catch (err) {
            console.error('Error fetching message data for match:', match.match_id, err);
            
            // Handle JSON parsing error
            const otherUser = typeof match.other_user === 'string' 
              ? JSON.parse(match.other_user)
              : match.other_user;
            
            return {
              ...match,
              other_user: {
                id: otherUser.id,
                name: otherUser.name,
                avatar: otherUser.avatar
              },
              last_message: null,
              unread_count: 0
            };
          }
        })
      );
      
      return matchesWithMessages as MatchWithProfile[];
    }
    
    // Parse the other_user field before returning
    return (data || []).map(match => {
      const otherUser = typeof match.other_user === 'string' 
        ? JSON.parse(match.other_user)
        : match.other_user;
        
      return {
        ...match,
        other_user: {
          id: otherUser.id,
          name: otherUser.name,
          avatar: otherUser.avatar
        }
      };
    }) as MatchWithProfile[];
  } catch (error) {
    console.error('Error getting user matches:', error);
    return [];
  }
};

/**
 * Force check for matches that may have been missed
 */
export const forceCheckForMatches = async (userId: string): Promise<number> => {
  if (!userId) return 0;
  
  try {
    console.log('Force checking for missed matches for user:', userId);
    
    // Get all users the current user has liked
    const { data: likedUsers, error: likedUsersError } = await supabase
      .from('profile_interactions')
      .select('target_profile_id')
      .eq('user_id', userId)
      .in('interaction_type', ['like', 'superlike']);
      
    if (likedUsersError) throw likedUsersError;
    
    if (!likedUsers || likedUsers.length === 0) {
      console.log('No likes found from this user');
      return 0;
    }
    
    const likedUserIds = likedUsers.map(like => like.target_profile_id);
    console.log('User has liked', likedUserIds.length, 'profiles');
    
    // Get all users who have liked the current user
    const { data: likesReceived, error: likesReceivedError } = await supabase
      .from('profile_interactions')
      .select('user_id')
      .eq('target_profile_id', userId)
      .in('interaction_type', ['like', 'superlike']);
      
    if (likesReceivedError) throw likesReceivedError;
    
    if (!likesReceived || likesReceived.length === 0) {
      console.log('No likes received by this user');
      return 0;
    }
    
    const userIdsWhoLikedMe = likesReceived.map(like => like.user_id);
    console.log('User has been liked by', userIdsWhoLikedMe.length, 'profiles');
    
    // Find mutual likes (intersection of the two arrays)
    const mutualLikes = likedUserIds.filter(id => userIdsWhoLikedMe.includes(id));
    console.log('Found', mutualLikes.length, 'mutual likes');
    
    if (mutualLikes.length === 0) return 0;
    
    // Check which of these mutual likes do not already have a match
    let newMatchesCreated = 0;
    
    for (const otherUserId of mutualLikes) {
      // Check if a match already exists
      const { data: existingMatch, error: checkMatchError } = await supabase
        .from('matches')
        .select('id')
        .or(`(user_id_1.eq.${userId}.and.user_id_2.eq.${otherUserId}).or.(user_id_1.eq.${otherUserId}.and.user_id_2.eq.${userId})`)
        .maybeSingle();
        
      if (checkMatchError) {
        console.error('Error checking for existing match:', checkMatchError);
        continue;
      }
      
      if (!existingMatch) {
        // Create a new match
        const matchCreated = await createMatch(userId, otherUserId);
        if (matchCreated) {
          newMatchesCreated++;
          console.log('Created new match between', userId, 'and', otherUserId);
        }
      }
    }
    
    console.log('Created', newMatchesCreated, 'new matches');
    return newMatchesCreated;
  } catch (error) {
    console.error('Error in forceCheckForMatches:', error);
    return 0;
  }
};

/**
 * Get compatible profiles for discover
 */
export const getCompatibleProfiles = async (userId: string, distance: number, sortOption: string): Promise<DiscoverProfile[]> => {
  if (!userId) return [];
  
  try {
    console.log('Getting compatible profiles for user:', userId, distance, sortOption);
    
    // Get profiles that meet the criteria
    const { data, error } = await supabase
      .rpc('get_compatible_profiles', {
        user_id: userId,
        max_distance: distance
      });
      
    if (error) {
      console.error('Error in getCompatibleProfiles RPC call:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting compatible profiles:', error);
    return [];
  }
};

// Export the matchingService object with all functions
export const matchingService = {
  checkIfMatched,
  createMatch,
  getUserMatches,
  forceCheckForMatches,
  getCompatibleProfiles
};
