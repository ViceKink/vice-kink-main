
/**
 * Interface for profiles in discover view
 */
export interface DiscoverProfile {
  id: string;
  name: string;
  age: number;
  location: string;
  occupation?: string;
  religion?: string;
  height?: string;
  verified: boolean;
  avatar?: string;
  photos: string[];
  bio?: string;
  passions?: string[];
  vices?: string[];
  kinks?: string[];
  about: Record<string, any>;
}

export type InteractionType = 'like' | 'dislike' | 'superlike';

export interface InteractionResult {
  success: boolean;
  matched: boolean;
}
