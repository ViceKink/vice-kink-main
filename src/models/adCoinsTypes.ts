
export interface UserAdCoins {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  consecutive_ads_watched: number;
  last_ad_watched: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdCoinsTransaction {
  success: boolean;
  previous_balance?: number;
  amount_added?: number;
  amount_spent?: number;
  bonus?: number;
  new_balance?: number;
  consecutive_ads?: number;
  feature?: string;
  error?: string;
  balance?: number;
  required?: number;
}

export type AdCoinFeature = 
  | 'view_like'
  | 'extra_likes'
  | 'rewind'
  | 'profile_boost'
  | 'post_boost'
  | 'super_like'
  | 'match_with_artist'
  | 'REVEAL_PROFILE';

export interface FeatureCost {
  id: AdCoinFeature;
  name: string;
  description: string;
  cost: number;
  icon: string;
}

export const FEATURE_COSTS: Record<AdCoinFeature, number> = {
  view_like: 1,
  extra_likes: 1,
  rewind: 1,
  profile_boost: 5,
  post_boost: 5,
  super_like: 3,
  match_with_artist: 2,
  REVEAL_PROFILE: 1
};
