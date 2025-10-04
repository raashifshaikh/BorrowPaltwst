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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_type: string
          achievement_value: number
          created_at: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          achievement_type: string
          achievement_value?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          achievement_type?: string
          achievement_value?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          category: string
          created_at: string | null
          description: string
          icon: string
          id: string
          name: string
          rarity: string
          requirement_type: string
          requirement_value: number
          xp_reward: number
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          icon: string
          id?: string
          name: string
          rarity?: string
          requirement_type: string
          requirement_value: number
          xp_reward?: number
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          name?: string
          rarity?: string
          requirement_type?: string
          requirement_value?: number
          xp_reward?: number
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          attachments: string[] | null
          created_at: string | null
          from_user_id: string
          id: string
          is_system_message: boolean | null
          listing_id: string | null
          message_text: string
          order_id: string | null
          read_at: string | null
          to_user_id: string
        }
        Insert: {
          attachments?: string[] | null
          created_at?: string | null
          from_user_id: string
          id?: string
          is_system_message?: boolean | null
          listing_id?: string | null
          message_text: string
          order_id?: string | null
          read_at?: string | null
          to_user_id: string
        }
        Update: {
          attachments?: string[] | null
          created_at?: string | null
          from_user_id?: string
          id?: string
          is_system_message?: boolean | null
          listing_id?: string | null
          message_text?: string
          order_id?: string | null
          read_at?: string | null
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_chat_from_profile"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_chat_from_profile"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_chat_to_profile"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_chat_to_profile"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      listings: {
        Row: {
          category_id: string | null
          condition: Database["public"]["Enums"]["listing_condition"] | null
          created_at: string | null
          currency: string | null
          delivery_options:
            | Database["public"]["Enums"]["delivery_option"][]
            | null
          description: string
          favorites_count: number | null
          featured: boolean | null
          id: string
          images: string[] | null
          location: Json | null
          price: number
          price_type: Database["public"]["Enums"]["price_type"] | null
          seller_id: string
          status: Database["public"]["Enums"]["listing_status"] | null
          title: string
          type: Database["public"]["Enums"]["listing_type"]
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          category_id?: string | null
          condition?: Database["public"]["Enums"]["listing_condition"] | null
          created_at?: string | null
          currency?: string | null
          delivery_options?:
            | Database["public"]["Enums"]["delivery_option"][]
            | null
          description: string
          favorites_count?: number | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          location?: Json | null
          price: number
          price_type?: Database["public"]["Enums"]["price_type"] | null
          seller_id: string
          status?: Database["public"]["Enums"]["listing_status"] | null
          title: string
          type: Database["public"]["Enums"]["listing_type"]
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          category_id?: string | null
          condition?: Database["public"]["Enums"]["listing_condition"] | null
          created_at?: string | null
          currency?: string | null
          delivery_options?:
            | Database["public"]["Enums"]["delivery_option"][]
            | null
          description?: string
          favorites_count?: number | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          location?: Json | null
          price?: number
          price_type?: Database["public"]["Enums"]["price_type"] | null
          seller_id?: string
          status?: Database["public"]["Enums"]["listing_status"] | null
          title?: string
          type?: Database["public"]["Enums"]["listing_type"]
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          body: string
          created_at: string | null
          data: Json | null
          expires_at: string | null
          id: string
          priority: string | null
          read: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          body: string
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          priority?: string | null
          read?: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          body?: string
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          priority?: string | null
          read?: boolean | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      order_negotiations: {
        Row: {
          action: Database["public"]["Enums"]["negotiation_action"]
          amount: number | null
          created_at: string | null
          from_user_id: string
          id: string
          message: string | null
          order_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["negotiation_action"]
          amount?: number | null
          created_at?: string | null
          from_user_id: string
          id?: string
          message?: string | null
          order_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["negotiation_action"]
          amount?: number | null
          created_at?: string | null
          from_user_id?: string
          id?: string
          message?: string | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_negotiations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_id: string
          created_at: string | null
          currency: string | null
          delivery_address: Json | null
          delivery_scanned_at: string | null
          delivery_scanned_by: string | null
          final_amount: number
          id: string
          listing_id: string
          negotiated_price: number | null
          notes: string | null
          original_price: number
          qr_code_data: Json | null
          quantity: number | null
          return_scanned_at: string | null
          return_scanned_by: string | null
          seller_id: string
          service_end_scan: string | null
          service_start_scan: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          stripe_payment_intent_id: string | null
          updated_at: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          currency?: string | null
          delivery_address?: Json | null
          delivery_scanned_at?: string | null
          delivery_scanned_by?: string | null
          final_amount: number
          id?: string
          listing_id: string
          negotiated_price?: number | null
          notes?: string | null
          original_price: number
          qr_code_data?: Json | null
          quantity?: number | null
          return_scanned_at?: string | null
          return_scanned_by?: string | null
          seller_id: string
          service_end_scan?: string | null
          service_start_scan?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          currency?: string | null
          delivery_address?: Json | null
          delivery_scanned_at?: string | null
          delivery_scanned_by?: string | null
          final_amount?: number
          id?: string
          listing_id?: string
          negotiated_price?: number | null
          notes?: string | null
          original_price?: number
          qr_code_data?: Json | null
          quantity?: number | null
          return_scanned_at?: string | null
          return_scanned_by?: string | null
          seller_id?: string
          service_end_scan?: string | null
          service_start_scan?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_orders_buyer"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_orders_buyer"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_orders_listing"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_orders_seller"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_orders_seller"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          custom_title: string | null
          email: string | null
          full_name: string | null
          id: string
          is_verified: boolean | null
          last_activity_date: string | null
          location: string | null
          name: string | null
          pending_balance: number | null
          phone: string | null
          profile_color: string | null
          profile_frame: string | null
          referral_code: string | null
          streak_days: number
          trust_score: number
          updated_at: string | null
          wallet_balance: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          custom_title?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_verified?: boolean | null
          last_activity_date?: string | null
          location?: string | null
          name?: string | null
          pending_balance?: number | null
          phone?: string | null
          profile_color?: string | null
          profile_frame?: string | null
          referral_code?: string | null
          streak_days?: number
          trust_score?: number
          updated_at?: string | null
          wallet_balance?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          custom_title?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          last_activity_date?: string | null
          location?: string | null
          name?: string | null
          pending_balance?: number | null
          phone?: string | null
          profile_color?: string | null
          profile_frame?: string | null
          referral_code?: string | null
          streak_days?: number
          trust_score?: number
          updated_at?: string | null
          wallet_balance?: number | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          referral_code: string
          referred_id: string
          referrer_id: string
          status: string
          xp_awarded: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referral_code: string
          referred_id: string
          referrer_id: string
          status?: string
          xp_awarded?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          status?: string
          xp_awarded?: number
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          listing_id: string
          order_id: string
          rating: number
          reviewed_user_id: string
          reviewer_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          listing_id: string
          order_id: string
          rating: number
          reviewed_user_id: string
          reviewer_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          listing_id?: string
          order_id?: string
          rating?: number
          reviewed_user_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      service_orders: {
        Row: {
          buyer_id: string | null
          created_at: string | null
          final_amount: number | null
          id: string
          notes: string | null
          provider_id: string | null
          service_id: string | null
          status: string | null
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string | null
          final_amount?: number | null
          id?: string
          notes?: string | null
          provider_id?: string | null
          service_id?: string | null
          status?: string | null
        }
        Update: {
          buyer_id?: string | null
          created_at?: string | null
          final_amount?: number | null
          id?: string
          notes?: string | null
          provider_id?: string | null
          service_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_service_orders_buyer"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_service_orders_buyer"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_service_orders_provider"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_service_orders_provider"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_service_orders_service"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "service_orders_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      services: {
        Row: {
          availability_status: string | null
          category: string | null
          created_at: string | null
          description: string | null
          duration_hours: number | null
          id: string
          images: string[] | null
          location: string | null
          price: number | null
          provider_id: string | null
          title: string
        }
        Insert: {
          availability_status?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          images?: string[] | null
          location?: string | null
          price?: number | null
          provider_id?: string | null
          title: string
        }
        Update: {
          availability_status?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          images?: string[] | null
          location?: string | null
          price?: number | null
          provider_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_addresses: {
        Row: {
          city: string
          country: string
          created_at: string | null
          id: string
          is_default: boolean | null
          label: string
          line1: string
          line2: string | null
          postcode: string
          state: string
          user_id: string
        }
        Insert: {
          city: string
          country?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          label: string
          line1: string
          line2?: string | null
          postcode: string
          state: string
          user_id: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          label?: string
          line1?: string
          line2?: string | null
          postcode?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_levels: {
        Row: {
          created_at: string | null
          id: string
          level: number
          title: string
          updated_at: string | null
          user_id: string
          xp: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          level?: number
          title?: string
          updated_at?: string | null
          user_id: string
          xp?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: number
          title?: string
          updated_at?: string | null
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      user_payment_methods: {
        Row: {
          created_at: string | null
          expiry: string | null
          id: string
          is_default: boolean | null
          last4: string | null
          provider: string
          provider_payment_method_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expiry?: string | null
          id?: string
          is_default?: boolean | null
          last4?: string | null
          provider: string
          provider_payment_method_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expiry?: string | null
          id?: string
          is_default?: boolean | null
          last4?: string | null
          provider?: string
          provider_payment_method_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      user_stats: {
        Row: {
          level: number | null
          on_time_returns: number | null
          rating: number | null
          title: string | null
          total_borrows: number | null
          total_lends: number | null
          trust_score: number | null
          user_id: string | null
          xp: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      award_xp: {
        Args: { p_user_id: string; p_xp: number }
        Returns: undefined
      }
      create_notification: {
        Args: {
          p_action_label?: string
          p_action_url?: string
          p_body: string
          p_data?: Json
          p_priority?: string
          p_title: string
          p_type: Database["public"]["Enums"]["notification_type"]
          p_user_id: string
        }
        Returns: string
      }
      generate_order_qr_code: {
        Args: { p_order_id: string }
        Returns: Json
      }
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      verify_qr_scan: {
        Args: { p_order_id: string; p_qr_secret: string; p_scan_type: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      delivery_option: "pickup" | "delivery" | "both"
      listing_condition: "new" | "like_new" | "good" | "fair" | "poor"
      listing_status: "active" | "paused" | "sold" | "deleted"
      listing_type: "item" | "service"
      negotiation_action: "accept" | "decline" | "counter"
      notification_type: "order" | "message" | "payment" | "listing" | "system"
      order_status:
        | "pending"
        | "negotiating"
        | "accepted"
        | "paid"
        | "shipped"
        | "completed"
        | "cancelled"
        | "rejected"
        | "in_progress"
      price_type: "fixed" | "hourly" | "per_day" | "negotiable"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "moderator", "user"],
      delivery_option: ["pickup", "delivery", "both"],
      listing_condition: ["new", "like_new", "good", "fair", "poor"],
      listing_status: ["active", "paused", "sold", "deleted"],
      listing_type: ["item", "service"],
      negotiation_action: ["accept", "decline", "counter"],
      notification_type: ["order", "message", "payment", "listing", "system"],
      order_status: [
        "pending",
        "negotiating",
        "accepted",
        "paid",
        "shipped",
        "completed",
        "cancelled",
        "rejected",
        "in_progress",
      ],
      price_type: ["fixed", "hourly", "per_day", "negotiable"],
    },
  },
} as const
