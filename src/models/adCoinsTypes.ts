
export interface AdCoinsTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'earn' | 'spend';
  reason: string;
  feature?: string;
  created_at: string;
  success?: boolean;
  required?: number;
  bonus?: number;
}

export interface UserAdCoins {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  consecutive_ads_watched: number;
  last_ad_watched?: string;
  created_at: string;
  updated_at: string;
}

export type AdCoinFeature = 
  | 'BOOST_PROFILE' 
  | 'REVEAL_PROFILE' 
  | 'REVEAL_IMAGE'
  | 'SWIPE_RIGHT' 
  | 'SEE_LIKES';

export const FEATURE_COSTS: Record<AdCoinFeature, number> = {
  'BOOST_PROFILE': 5,
  'REVEAL_PROFILE': 1,
  'REVEAL_IMAGE': 1,
  'SWIPE_RIGHT': 1,
  'SEE_LIKES': 2
};

export interface AdCoinsContextType {
  balance: number;
  earnAdCoins: (amount: number) => Promise<void>;
  spendAdCoins: (amount: number, feature: string) => Promise<boolean>;
  isAdReady: boolean;
  showAd: () => Promise<boolean>;
}
