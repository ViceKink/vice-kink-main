export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          parent_id: string | null
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_id?: string | null
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_id?: string | null
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          kink_id: string | null
          name: string
          type: string
          vice_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          kink_id?: string | null
          name: string
          type: string
          vice_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          kink_id?: string | null
          name?: string
          type?: string
          vice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communities_kink_id_fkey"
            columns: ["kink_id"]
            isOneToOne: false
            referencedRelation: "kinks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communities_vice_id_fkey"
            columns: ["vice_id"]
            isOneToOne: false
            referencedRelation: "vices"
            referencedColumns: ["id"]
          },
        ]
      }
      kinks: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_saves: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_saves_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_count: number | null
          community_id: string | null
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          media_url: string | null
          saves_count: number | null
          title: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          community_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          media_url?: string | null
          saves_count?: number | null
          title?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comments_count?: number | null
          community_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          media_url?: string | null
          saves_count?: number | null
          title?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_audio: {
        Row: {
          created_at: string | null
          id: string
          profile_id: string
          title: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_id: string
          title: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_id?: string
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_audio_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_kinks: {
        Row: {
          kink_id: string
          profile_id: string
        }
        Insert: {
          kink_id: string
          profile_id: string
        }
        Update: {
          kink_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_kinks_kink_id_fkey"
            columns: ["kink_id"]
            isOneToOne: false
            referencedRelation: "kinks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_kinks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_languages: {
        Row: {
          created_at: string | null
          id: string
          language: string
          profile_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          language: string
          profile_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          language?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_languages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_passions: {
        Row: {
          created_at: string | null
          id: string
          passion: string
          profile_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          passion: string
          profile_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          passion?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_passions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_photos: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          order_index: number
          profile_id: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          order_index: number
          profile_id: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          order_index?: number
          profile_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_photos_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_prompts: {
        Row: {
          answer: string
          created_at: string | null
          id: string
          order_index: number
          profile_id: string
          prompt: string
        }
        Insert: {
          answer: string
          created_at?: string | null
          id?: string
          order_index: number
          profile_id: string
          prompt: string
        }
        Update: {
          answer?: string
          created_at?: string | null
          id?: string
          order_index?: number
          profile_id?: string
          prompt?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_prompts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_vices: {
        Row: {
          profile_id: string
          vice_id: string
        }
        Insert: {
          profile_id: string
          vice_id: string
        }
        Update: {
          profile_id?: string
          vice_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_vices_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_vices_vice_id_fkey"
            columns: ["vice_id"]
            isOneToOne: false
            referencedRelation: "vices"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          bio: string | null
          birth_date: string | null
          created_at: string | null
          dating_intention: string | null
          drinking: string | null
          education: string | null
          ethnicity: string | null
          flirting_style: string | null
          gender: string | null
          height: string | null
          hometown: string | null
          id: string
          location: string | null
          looking_for: string | null
          name: string
          occupation: string | null
          preferences: Json | null
          quote: string | null
          relationship_status: string | null
          relationship_type: string | null
          religion: string | null
          sexuality: string | null
          smoking: boolean | null
          username: string | null
          verified: boolean | null
          zodiac: string | null
        }
        Insert: {
          age?: number | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string | null
          dating_intention?: string | null
          drinking?: string | null
          education?: string | null
          ethnicity?: string | null
          flirting_style?: string | null
          gender?: string | null
          height?: string | null
          hometown?: string | null
          id: string
          location?: string | null
          looking_for?: string | null
          name: string
          occupation?: string | null
          preferences?: Json | null
          quote?: string | null
          relationship_status?: string | null
          relationship_type?: string | null
          religion?: string | null
          sexuality?: string | null
          smoking?: boolean | null
          username?: string | null
          verified?: boolean | null
          zodiac?: string | null
        }
        Update: {
          age?: number | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string | null
          dating_intention?: string | null
          drinking?: string | null
          education?: string | null
          ethnicity?: string | null
          flirting_style?: string | null
          gender?: string | null
          height?: string | null
          hometown?: string | null
          id?: string
          location?: string | null
          looking_for?: string | null
          name?: string
          occupation?: string | null
          preferences?: Json | null
          quote?: string | null
          relationship_status?: string | null
          relationship_type?: string | null
          religion?: string | null
          sexuality?: string | null
          smoking?: boolean | null
          username?: string | null
          verified?: boolean | null
          zodiac?: string | null
        }
        Relationships: []
      }
      vices: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
