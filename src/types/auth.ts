export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  photos?: string[];
  occupation?: string;
  religion?: string;
  height?: string;
  interests?: string[];
  looking_for?: string;
  verified?: boolean;
  created_at?: string;
  updated_at?: string;
  flirting_style?: string;
  passion?: string;
  vices?: string[];
  kinks?: string[];
  audio_intro?: string;
  about?: {
    lifestyle?: string;
    education?: string;
    drinking?: string;
    smoking?: string;
    relationship_type?: string;
    kids?: string;
    star_sign?: string;
    politics?: string;
  };
}
