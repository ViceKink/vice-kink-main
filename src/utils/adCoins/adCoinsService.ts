
import { supabase } from "@/integrations/supabase/client";
import { AdCoinsTransaction, UserAdCoins } from "@/models/adCoinsTypes";
import { toast } from "sonner";

/**
 * Get the current user's AdCoins balance
 */
export const getUserAdCoins = async (userId: string): Promise<UserAdCoins | null> => {
  if (!userId) return null;
  
  try {
    // We need to use a proper query for user_adcoins table
    const { data, error } = await supabase
      .from('user_adcoins')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching user AdCoins:', error);
      return null;
    }
    
    return data as UserAdCoins;
  } catch (error) {
    console.error('Error getting user AdCoins:', error);
    return null;
  }
};

/**
 * Add AdCoins to the user's balance (after watching an ad)
 */
export const addAdCoins = async (
  userId: string, 
  amount: number = 1, 
  reason: string = 'ad_watch'
): Promise<AdCoinsTransaction | null> => {
  if (!userId) return null;
  
  try {
    // Call the add_adcoins RPC function
    const { data, error } = await supabase
      .rpc('add_adcoins', {
        p_user_id: userId,
        p_amount: amount,
        p_reason: reason
      });
      
    if (error) {
      console.error('Error adding AdCoins:', error);
      toast.error('Failed to add AdCoins');
      return null;
    }
    
    // Show a success message with info about bonus if applicable
    if (data && typeof data === 'object' && 'bonus' in data && (data.bonus as number) > 0) {
      toast.success(`Earned ${amount} AdCoins + ${data.bonus as number} bonus!`);
    } else {
      toast.success(`Earned ${amount} AdCoins!`);
    }
    
    return data as unknown as AdCoinsTransaction;
  } catch (error) {
    console.error('Error adding AdCoins:', error);
    toast.error('Failed to add AdCoins');
    return null;
  }
};

/**
 * Spend AdCoins for a premium feature
 */
export const spendAdCoins = async (
  userId: string,
  amount: number,
  feature: string
): Promise<AdCoinsTransaction | null> => {
  if (!userId) return null;
  
  try {
    // Call the spend_adcoins RPC function
    const { data, error } = await supabase
      .rpc('spend_adcoins', {
        p_user_id: userId,
        p_amount: amount,
        p_feature: feature
      });
      
    if (error) {
      console.error('Error spending AdCoins:', error);
      toast.error('Failed to spend AdCoins');
      return null;
    }
    
    if (data && typeof data === 'object' && 'success' in data && !(data.success as boolean)) {
      toast.error(`Insufficient AdCoins! You need ${data.required as number} AdCoins.`);
      return data as unknown as AdCoinsTransaction;
    }
    
    if (feature === 'view_like') {
      // Don't show a toast for view_like as we'll handle that in the component
    } else {
      toast.success(`Spent ${amount} AdCoins on ${feature}`);
    }
    
    return data as unknown as AdCoinsTransaction;
  } catch (error) {
    console.error('Error spending AdCoins:', error);
    toast.error('Failed to spend AdCoins');
    return null;
  }
};

/**
 * Mark a profile interaction as revealed
 */
export const revealProfileInteraction = async (
  userId: string,
  profileId: string
): Promise<boolean> => {
  try {
    // Update the profile_interactions record to set is_revealed = true
    const { error } = await supabase
      .from('profile_interactions')
      .update({ is_revealed: true })
      .eq('user_id', profileId)  // The liker's ID
      .eq('target_profile_id', userId);  // The current user's ID
      
    if (error) {
      console.error('Error revealing profile interaction:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error revealing profile interaction:', error);
    return false;
  }
};

/**
 * Check if a profile has been revealed by the user
 */
export const isProfileRevealed = async (
  userId: string,
  profileId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profile_interactions')
      .select('is_revealed')
      .eq('user_id', profileId)  // The liker's ID
      .eq('target_profile_id', userId)  // The current user's ID
      .maybeSingle();
      
    if (error) {
      console.error('Error checking if profile is revealed:', error);
      return false;
    }
    
    return data?.is_revealed || false;
  } catch (error) {
    console.error('Error checking if profile is revealed:', error);
    return false;
  }
};
