
export interface Profile {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  distance?: number;
  age?: number;
  photos?: string[];
  interests?: string[];
  location?: string;
  occupation?: string;
  verified?: boolean;
}

export interface DiscoverProfile {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  age?: number;
  photos?: string[];
  location?: string;
  distance?: string;
  occupation?: string;
  verified?: boolean;
  location_lat?: number;
  location_lng?: number;
}

export interface MatchWithProfile {
  match_id: string;
  matched_at: string;
  other_user_id: string;
  other_user: {
    id: string;
    name: string;
    avatar?: string;
  };
  last_message?: string | null;
  unread_count?: number;
}

export type AdCoinFeature = 'REVEAL_PROFILE' | 'BOOST_PROFILE' | 'SUPER_LIKE';

export interface ProfileInteractionResult {
  success: boolean;
  matched: boolean;
  interaction?: any;
}
