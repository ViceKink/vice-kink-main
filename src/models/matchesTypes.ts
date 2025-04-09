
export interface Match {
  id: string;
  user_id_1: string;
  user_id_2: string;
  matched_at: string;
  profiles_1?: {
    id: string;
    name: string;
    avatar?: string;
  };
  profiles_2?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
  image_url?: string;
  is_image_revealed?: boolean;
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
  last_message?: string;
  unread_count?: number;
}
