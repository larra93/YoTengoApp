export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          icon: string
          id: number
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          icon?: string
          id?: number
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          icon?: string
          id?: number
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          need_id: string
          offer_id: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          need_id: string
          offer_id?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          need_id?: string
          offer_id?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_need_id_fkey"
            columns: ["need_id"]
            isOneToOne: false
            referencedRelation: "needs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      needs: {
        Row: {
          address_label: string | null
          budget_or_offer_details: string | null
          category_id: number
          created_at: string
          deal_type: Database["public"]["Enums"]["deal_type"]
          description: string
          end_date: string | null
          id: string
          location: unknown
          reference_image_url: string | null
          start_date: string
          status: Database["public"]["Enums"]["need_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_label?: string | null
          budget_or_offer_details?: string | null
          category_id: number
          created_at?: string
          deal_type: Database["public"]["Enums"]["deal_type"]
          description: string
          end_date?: string | null
          id?: string
          location?: unknown
          reference_image_url?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["need_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_label?: string | null
          budget_or_offer_details?: string | null
          category_id?: number
          created_at?: string
          deal_type?: Database["public"]["Enums"]["deal_type"]
          description?: string
          end_date?: string | null
          id?: string
          location?: unknown
          reference_image_url?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["need_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "needs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "needs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          conditions: string | null
          created_at: string
          id: string
          item_photo_url: string | null
          need_id: string
          price_offered: number | null
          status: Database["public"]["Enums"]["offer_status"]
          supplier_id: string
          swap_offered_details: string | null
          updated_at: string
        }
        Insert: {
          conditions?: string | null
          created_at?: string
          id?: string
          item_photo_url?: string | null
          need_id: string
          price_offered?: number | null
          status?: Database["public"]["Enums"]["offer_status"]
          supplier_id: string
          swap_offered_details?: string | null
          updated_at?: string
        }
        Update: {
          conditions?: string | null
          created_at?: string
          id?: string
          item_photo_url?: string | null
          need_id?: string
          price_offered?: number | null
          status?: Database["public"]["Enums"]["offer_status"]
          supplier_id?: string
          swap_offered_details?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_need_id_fkey"
            columns: ["need_id"]
            isOneToOne: false
            referencedRelation: "needs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          location: unknown
          neighborhood: string | null
          phone: string | null
          rating_avg: number
          rating_count: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id: string
          location?: unknown
          neighborhood?: string | null
          phone?: string | null
          rating_avg?: number
          rating_count?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          location?: unknown
          neighborhood?: string | null
          phone?: string | null
          rating_avg?: number
          rating_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          platform?: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          need_id: string
          rating: number
          reviewee_id: string
          reviewer_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          need_id: string
          rating: number
          reviewee_id: string
          reviewer_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          need_id?: string
          rating?: number
          reviewee_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_need_id_fkey"
            columns: ["need_id"]
            isOneToOne: false
            referencedRelation: "needs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_offer: {
        Args: { p_offer_id: string }
        Returns: {
          conditions: string | null
          created_at: string
          id: string
          item_photo_url: string | null
          need_id: string
          price_offered: number | null
          status: Database["public"]["Enums"]["offer_status"]
          supplier_id: string
          swap_offered_details: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "offers"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      can_access_chat: {
        Args: { p_need_id: string; p_user_id: string }
        Returns: boolean
      }
      cancel_need: {
        Args: { p_need_id: string }
        Returns: {
          address_label: string | null
          budget_or_offer_details: string | null
          category_id: number
          created_at: string
          deal_type: Database["public"]["Enums"]["deal_type"]
          description: string
          end_date: string | null
          id: string
          location: unknown
          reference_image_url: string | null
          start_date: string
          status: Database["public"]["Enums"]["need_status"]
          title: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "needs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      complete_need: {
        Args: { p_need_id: string }
        Returns: {
          address_label: string | null
          budget_or_offer_details: string | null
          category_id: number
          created_at: string
          deal_type: Database["public"]["Enums"]["deal_type"]
          description: string
          end_date: string | null
          id: string
          location: unknown
          reference_image_url: string | null
          start_date: string
          status: Database["public"]["Enums"]["need_status"]
          title: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "needs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_need: {
        Args: {
          p_address_label?: string
          p_budget_or_offer_details?: string
          p_category_id: number
          p_deal_type: Database["public"]["Enums"]["deal_type"]
          p_description: string
          p_end_date?: string
          p_lat?: number
          p_lng?: number
          p_reference_image_url?: string
          p_start_date: string
          p_title: string
        }
        Returns: {
          address_label: string | null
          budget_or_offer_details: string | null
          category_id: number
          created_at: string
          deal_type: Database["public"]["Enums"]["deal_type"]
          description: string
          end_date: string | null
          id: string
          location: unknown
          reference_image_url: string | null
          start_date: string
          status: Database["public"]["Enums"]["need_status"]
          title: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "needs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_review: {
        Args: { p_comment?: string; p_need_id: string; p_rating: number }
        Returns: {
          comment: string | null
          created_at: string
          id: string
          need_id: string
          rating: number
          reviewee_id: string
          reviewer_id: string
        }
        SetofOptions: {
          from: "*"
          to: "reviews"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      nearby_needs: {
        Args: {
          p_category_id?: number
          p_deal_type?: Database["public"]["Enums"]["deal_type"]
          p_lat: number
          p_limit?: number
          p_lng: number
          p_offset?: number
          p_radius_km?: number
        }
        Returns: {
          address_label: string
          author_avatar_url: string
          author_name: string
          budget_or_offer_details: string
          category_icon: string
          category_id: number
          category_name: string
          category_slug: string
          created_at: string
          deal_type: Database["public"]["Enums"]["deal_type"]
          description: string
          distance_km: number
          end_date: string
          id: string
          reference_image_url: string
          start_date: string
          status: Database["public"]["Enums"]["need_status"]
          title: string
          updated_at: string
          user_id: string
        }[]
      }
      notify_user: {
        Args: {
          p_body: string
          p_data?: Json
          p_title: string
          p_user_id: string
        }
        Returns: undefined
      }
      reject_offer: {
        Args: { p_offer_id: string }
        Returns: {
          conditions: string | null
          created_at: string
          id: string
          item_photo_url: string | null
          need_id: string
          price_offered: number | null
          status: Database["public"]["Enums"]["offer_status"]
          supplier_id: string
          swap_offered_details: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "offers"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      send_message: {
        Args: { p_body: string; p_need_id: string }
        Returns: {
          created_at: string
          id: string
          message: string
          need_id: string
          offer_id: string | null
          receiver_id: string
          sender_id: string
        }
        SetofOptions: {
          from: "*"
          to: "chat_messages"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_my_location: {
        Args: { p_lat: number; p_lng: number }
        Returns: undefined
      }
    }
    Enums: {
      deal_type: "rent" | "loan" | "swap"
      need_status: "open" | "matched" | "completed" | "cancelled"
      offer_status: "pending" | "accepted" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      deal_type: ["rent", "loan", "swap"],
      need_status: ["open", "matched", "completed", "cancelled"],
      offer_status: ["pending", "accepted", "rejected"],
    },
  },
} as const
