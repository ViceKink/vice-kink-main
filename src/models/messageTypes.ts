
export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
  image_url?: string;
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
