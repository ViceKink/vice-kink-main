
import { supabase } from '@/integrations/supabase/client';

/**
 * A service to handle the complete deletion of a user profile while preserving their content.
 * Comments and posts are kept but anonymized to "Deleted User"
 */
export const deleteUserProfile = async (userId: string) => {
  try {
    // Instead of deleting comments and posts, we'll update them to show "Deleted User"
    // First, anonymize comments by this user
    const { error: commentsError } = await supabase
      .from('posts')
      .update({ 
        user_id: null  // This will make the posts appear as from "Deleted User"
      })
      .eq('user_id', userId);
    
    if (commentsError) {
      console.error("Error anonymizing user posts:", commentsError);
    }

    // Anonymize comments instead of deleting them
    const { error: postsError } = await supabase
      .from('comments')
      .update({ 
        user_id: null  // This will make the comments appear as from "Deleted User"
      })
      .eq('user_id', userId);
    
    if (postsError) {
      console.error("Error anonymizing user comments:", postsError);
    }

    // Delete all post likes by this user - these can be removed safely
    const { error: likesError } = await supabase
      .from('post_likes')
      .delete()
      .eq('user_id', userId);
    
    if (likesError) {
      console.error("Error deleting user likes:", likesError);
    }

    // Delete all post saves by this user
    const { error: savesError } = await supabase
      .from('post_saves')
      .delete()
      .eq('user_id', userId);
    
    if (savesError) {
      console.error("Error deleting user saves:", savesError);
    }

    // Delete all profile interactions involving this user
    const { error: interactionsError1 } = await supabase
      .from('profile_interactions')
      .delete()
      .eq('user_id', userId);
    
    const { error: interactionsError2 } = await supabase
      .from('profile_interactions')
      .delete()
      .eq('target_profile_id', userId);
    
    if (interactionsError1 || interactionsError2) {
      console.error("Error deleting user interactions:", interactionsError1 || interactionsError2);
    }

    // Delete all matches involving this user
    const { error: matchesError1 } = await supabase
      .from('matches')
      .delete()
      .eq('user_id_1', userId);
    
    const { error: matchesError2 } = await supabase
      .from('matches')
      .delete()
      .eq('user_id_2', userId);
    
    if (matchesError1 || matchesError2) {
      console.error("Error deleting user matches:", matchesError1 || matchesError2);
    }

    // Delete all messages involving this user
    const { error: messagesError1 } = await supabase
      .from('messages')
      .delete()
      .eq('sender_id', userId);
    
    const { error: messagesError2 } = await supabase
      .from('messages')
      .delete()
      .eq('receiver_id', userId);
    
    if (messagesError1 || messagesError2) {
      console.error("Error deleting user messages:", messagesError1 || messagesError2);
    }

    // Delete the user's profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (profileError) {
      console.error("Error deleting user profile:", profileError);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in profile deletion service:", error);
    return { success: false, error };
  }
};
