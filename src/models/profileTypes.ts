
export interface Profile {
  id: string;
  name: string;
  age: number;
  location: string;
  distance?: string;
  photos: string[];
  occupation?: string;
  religion?: string;
  height?: string;
  verified: boolean;
  rating?: number;
  interactionType?: 'like' | 'superlike';
  avatar?: string;
  is_revealed?: boolean;
  location_lat?: number;
  location_lng?: number;
}

export interface ProfileWithInteraction extends Profile {
  interactionType: 'like' | 'superlike';
}
