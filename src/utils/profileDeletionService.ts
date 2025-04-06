
import { supabase } from '@/integrations/supabase/client';

/**
 * A service to handle the complete deletion of a user profile including all related data.
 * This ensures that when a user deletes their account, all their data is removed.
 */
export const deleteUserProfile = async (userId: string) => {
  try {
    // Using DB functions is more efficient than deleting records one by one from the client
    // The auth.users cascade will handle most deletions, but we need to handle some manually

    // 1. Delete all comments by this user
    const { error: commentsError } = await supabase
      .from('comments')
      .delete()
      .eq('user_id', userId);
    
    if (commentsError) {
      console.error("Error deleting user comments:", commentsError);
    }

    // 2. Delete all post likes by this user
    const { error: likesError } = await supabase
      .from('post_likes')
      .delete()
      .eq('user_id', userId);
    
    if (likesError) {
      console.error("Error deleting user likes:", likesError);
    }

    // 3. Delete all post saves by this user
    const { error: savesError } = await supabase
      .from('post_saves')
      .delete()
      .eq('user_id', userId);
    
    if (savesError) {
      console.error("Error deleting user saves:", savesError);
    }

    // 4. Delete all profile interactions involving this user
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

    // 5. Delete all matches involving this user
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

    // 6. Delete all messages involving this user
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

    // 7. Delete all posts by this user
    // This will cascade delete all comments, likes, etc. attached to these posts
    const { error: postsError } = await supabase
      .from('posts')
      .delete()
      .eq('user_id', userId);
    
    if (postsError) {
      console.error("Error deleting user posts:", postsError);
    }

    // 8. Finally, delete the user's profile
    // Note: auth.users deletion will be handled by Supabase auth admin API
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
