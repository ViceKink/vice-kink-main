
export interface FlirtingStyle {
  direct: number;
  playful: number;
  intellectual: number;
  physical: number;
  romantic: number;
}

export interface UserPreferences {
  preferred_gender?: string[];
  age_range?: {
    min: number;
    max: number;
  };
  max_distance?: number;
  preferred_ethnicity?: string[];
  preferred_religion?: string[];
  preferred_relationship_type?: string[];
  preferred_language?: string[];
  preferred_education?: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username?: string;
  birthDate?: string; // ISO string for date of birth
  age?: number;
  photos?: string[];
  location?: string;
  hometown?: string; 
  verified?: boolean;
  quote?: string;
  about?: {
    occupation?: string;
    status?: 'single' | 'married' | 'it\'s complicated';
    height?: string;
    zodiac?: string;
    religion?: string;
    languages?: string[];
    sexuality?: string;
    gender?: string;
    ethnicity?: string;
    education?: string;
    relationshipType?: string;
    datingIntention?: string;
    lifestyle?: {
      smoking?: boolean;
      drinking?: string;
      exercise?: string;
      diet?: string;
    };
  };
  vices?: string[];
  kinks?: string[];
  bio?: string;
  lookingFor?: string;
  flirtingStyle?: string | FlirtingStyle;
  audio?: {
    title: string;
    url: string;
  };
  passions?: string[];
  music?: {
    favoriteSong?: string;
    artists?: string[];
  };
  preferences?: UserPreferences;
}
