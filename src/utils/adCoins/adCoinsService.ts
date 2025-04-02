
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
    
    toast.success(`Spent ${amount} AdCoins on ${feature}`);
    return data as unknown as AdCoinsTransaction;
  } catch (error) {
    console.error('Error spending AdCoins:', error);
    toast.error('Failed to spend AdCoins');
    return null;
  }
};
