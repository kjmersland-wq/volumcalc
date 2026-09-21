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
          address: string | null
          brand_color: string
          company_name: string
          contact_email: string | null
          created_at: string
          currency: string
          default_language: string
          id: string
          is_demo: boolean
          logo_url: string | null
          org_number: string | null
          phone: string | null
          price_per_m3: number
          room_names: string[]
          updated_at: string
          upload_token: string
          website: string | null
        }
        Insert: {
          address?: string | null
          brand_color?: string
          company_name?: string
          contact_email?: string | null
          created_at?: string
          currency?: string
          default_language?: string
          id: string
          is_demo?: boolean
          logo_url?: string | null
          org_number?: string | null
          phone?: string | null
          price_per_m3?: number
          room_names?: string[]
          updated_at?: string
          upload_token?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          brand_color?: string
          company_name?: string
          contact_email?: string | null
          created_at?: string
          currency?: string
          default_language?: string
          id?: string
          is_demo?: boolean
          logo_url?: string | null
          org_number?: string | null
          phone?: string | null
          price_per_m3?: number
          room_names?: string[]
          updated_at?: string
          upload_token?: string
          website?: string | null
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
          delivery_address: string | null
          delivery_carry_distance: string | null
          delivery_elevator: boolean
          delivery_floor: string | null
          delivery_notes: string | null
          has_elevator: boolean
          id: string
          internal_notes: string | null
          move_date: string | null
          move_distance_km: number | null
          move_from: string | null
          move_to: string | null
          notes: string | null
          packing_level: string | null
          packing_materials: Json
          packing_notes: string | null
          packing_requested: boolean
          photo_urls: string[]
          report_language: string
          report_title: string | null
          share_token: string
          status: string
          storage_address: string | null
          storage_company: string | null
          storage_contact: string | null
          storage_enabled: boolean
          storage_phone: string | null
          tender_mode: boolean
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
          delivery_address?: string | null
          delivery_carry_distance?: string | null
          delivery_elevator?: boolean
          delivery_floor?: string | null
          delivery_notes?: string | null
          has_elevator?: boolean
          id?: string
          internal_notes?: string | null
          move_date?: string | null
          move_distance_km?: number | null
          move_from?: string | null
          move_to?: string | null
          notes?: string | null
          packing_level?: string | null
          packing_materials?: Json
          packing_notes?: string | null
          packing_requested?: boolean
          photo_urls?: string[]
          report_language?: string
          report_title?: string | null
          share_token?: string
          status?: string
          storage_address?: string | null
          storage_company?: string | null
          storage_contact?: string | null
          storage_enabled?: boolean
          storage_phone?: string | null
          tender_mode?: boolean
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
          delivery_address?: string | null
          delivery_carry_distance?: string | null
          delivery_elevator?: boolean
          delivery_floor?: string | null
          delivery_notes?: string | null
          has_elevator?: boolean
          id?: string
          internal_notes?: string | null
          move_date?: string | null
          move_distance_km?: number | null
          move_from?: string | null
          move_to?: string | null
          notes?: string | null
          packing_level?: string | null
          packing_materials?: Json
          packing_notes?: string | null
          packing_requested?: boolean
          photo_urls?: string[]
          report_language?: string
          report_title?: string | null
          share_token?: string
          status?: string
          storage_address?: string | null
          storage_company?: string | null
          storage_contact?: string | null
          storage_enabled?: boolean
          storage_phone?: string | null
          tender_mode?: boolean
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
      profiles: {
        Row: {
          account_type: string
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          full_name: string | null
          id: string
          notification_email: string | null
          phone: string | null
          postal_code: string | null
          preferred_report_language: string
          updated_at: string
        }
        Insert: {
          account_type?: string
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          notification_email?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_report_language?: string
          updated_at?: string
        }
        Update: {
          account_type?: string
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          notification_email?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_report_language?: string
          updated_at?: string
        }
        Relationships: []
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "unlimited" | "user"
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
      app_role: ["admin", "unlimited", "user"],
    },
  },
} as const
