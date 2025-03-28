
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username?: string;
  age?: number;
  birthDate?: string;
  gender?: string;
  location?: string;
  hometown?: string;
  bio?: string;
  avatar?: string;
  photos?: string[];
  occupation?: string;
  religion?: string;
  height?: string;
  interests?: string[];
  looking_for?: string;
  lookingFor?: string;
  verified?: boolean;
  created_at?: string;
  updated_at?: string;
  flirting_style?: string;
  flirtingStyle?: string | FlirtingStyle;
  passion?: string[];
  passions?: string[];
  vices?: string[];
  kinks?: string[];
  quote?: string;
  audio?: {
    title: string;
    url: string;
  };
  preferences?: UserPreferences;
  about?: {
    lifestyle?: {
      smoking?: boolean;
      drinking?: string;
    };
    education?: string;
    drinking?: string;
    smoking?: boolean;
    relationship_type?: string;
    relationshipType?: string;
    datingIntention?: string;
    kids?: string;
    star_sign?: string;
    politics?: string;
    height?: string;
    zodiac?: string;
    religion?: string;
    languages?: string[];
    sexuality?: string;
    occupation?: string;
    status?: string;
    gender?: string;
    ethnicity?: string;
  };
}

export interface FlirtingStyle {
  direct: number;
  playful: number;
  intellectual: number;
  physical: number;
  romantic: number;
}

export interface UserPreferences {
  age_range?: {
    min: number;
    max: number;
  };
  preferred_gender?: string[];
  max_distance?: number;
  preferred_ethnicity?: string[];
  preferred_relationship_type?: string[];
  preferred_education?: string[];
}
