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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          brand_color: string
          company_name: string
          contact_email: string | null
          created_at: string
          currency: string
          default_language: string
          id: string
          logo_url: string | null
          price_per_m3: number
          updated_at: string
        }
        Insert: {
          brand_color?: string
          company_name?: string
          contact_email?: string | null
          created_at?: string
          currency?: string
          default_language?: string
          id: string
          logo_url?: string | null
          price_per_m3?: number
          updated_at?: string
        }
        Update: {
          brand_color?: string
          company_name?: string
          contact_email?: string | null
          created_at?: string
          currency?: string
          default_language?: string
          id?: string
          logo_url?: string | null
          price_per_m3?: number
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          email_sent: boolean
          handled: boolean
          id: string
          locale: string
          message: string
          name: string
          phone: string | null
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          email_sent?: boolean
          handled?: boolean
          id?: string
          locale?: string
          message: string
          name: string
          phone?: string | null
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          email_sent?: boolean
          handled?: boolean
          id?: string
          locale?: string
          message?: string
          name?: string
          phone?: string | null
          subject?: string
        }
        Relationships: []
      }
      estimate_items: {
        Row: {
          category: string | null
          confidence: number
          created_at: string
          deleted_at: string | null
          estimate_id: string
          height_cm: number
          id: string
          is_included: boolean
          length_cm: number
          name: string
          name_no: string | null
          notes: string | null
          photo_url: string | null
          quantity: number
          room_id: string | null
          tags: string[]
          volume_m3: number
          width_cm: number
        }
        Insert: {
          category?: string | null
          confidence?: number
          created_at?: string
          deleted_at?: string | null
          estimate_id: string
          height_cm?: number
          id?: string
          is_included?: boolean
          length_cm?: number
          name: string
          name_no?: string | null
          notes?: string | null
          photo_url?: string | null
          quantity?: number
          room_id?: string | null
          tags?: string[]
          volume_m3?: number
          width_cm?: number
        }
        Update: {
          category?: string | null
          confidence?: number
          created_at?: string
          deleted_at?: string | null
          estimate_id?: string
          height_cm?: number
          id?: string
          is_included?: boolean
          length_cm?: number
          name?: string
          name_no?: string | null
          notes?: string | null
          photo_url?: string | null
          quantity?: number
          room_id?: string | null
          tags?: string[]
          volume_m3?: number
          width_cm?: number
        }
        Relationships: [
          {
            foreignKeyName: "estimate_items_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_items_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "estimate_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_rooms: {
        Row: {
          created_at: string
          estimate_id: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          estimate_id: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          estimate_id?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimate_rooms_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          access_floor: number | null
          access_notes: string | null
          address: string | null
          carry_distance_m: number | null
          company_id: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          has_elevator: boolean
          id: string
          internal_notes: string | null
          move_date: string | null
          notes: string | null
          photo_urls: string[]
          share_token: string
          status: string
          total_volume_m3: number
          updated_at: string
        }
        Insert: {
          access_floor?: number | null
          access_notes?: string | null
          address?: string | null
          carry_distance_m?: number | null
          company_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          has_elevator?: boolean
          id?: string
          internal_notes?: string | null
          move_date?: string | null
          notes?: string | null
          photo_urls?: string[]
          share_token?: string
          status?: string
          total_volume_m3?: number
          updated_at?: string
        }
        Update: {
          access_floor?: number | null
          access_notes?: string | null
          address?: string | null
          carry_distance_m?: number | null
          company_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          has_elevator?: boolean
          id?: string
          internal_notes?: string | null
          move_date?: string | null
          notes?: string | null
          photo_urls?: string[]
          share_token?: string
          status?: string
          total_volume_m3?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          company_id: string | null
          created_at: string
          email: string | null
          estimate_id: string
          handled: boolean
          id: string
          message: string | null
          name: string
          phone: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          estimate_id: string
          handled?: boolean
          id?: string
          message?: string | null
          name: string
          phone?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          estimate_id?: string
          handled?: boolean
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
