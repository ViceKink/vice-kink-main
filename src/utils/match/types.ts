
import { Json } from "@/integrations/supabase/types";

// Basic profile interface
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

// Extended profile for discover
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
  // Add other common profile fields
}

// Interface for a match with profile details
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

// Types for likes/matches feature
export type AdCoinFeature = 'REVEAL_PROFILE' | 'BOOST_PROFILE' | 'SUPER_LIKE';

// Profile interaction result
export interface ProfileInteractionResult {
  success: boolean;
  matched: boolean;
  interaction?: any;
}
