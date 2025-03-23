
export interface FlirtingStyle {
  direct: number;
  playful: number;
  intellectual: number;
  physical: number;
  romantic: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  birthDate?: string; // New field for date of birth
  age?: number;
  photos?: string[];
  location?: string;
  hometown?: string; // New field for hometown
  verified?: boolean;
  quote?: string;
  about?: {
    occupation?: string;
    status?: 'single' | 'married' | 'it\'s complicated';
    height?: string;
    zodiac?: string;
    religion?: string;
    languages?: string[];
    sexuality?: string; // New field for sexuality
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
}
