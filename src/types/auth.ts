
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
  age?: number;
  email: string;
  photos?: string[];
  location?: string;
  verified?: boolean;
  quote?: string;
  about?: {
    occupation?: string;
    status?: 'single' | 'married' | 'it\'s complicated';
    height?: string;
    zodiac?: string;
    religion?: string;
    languages?: string[];
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
