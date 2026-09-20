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
      claims: {
        Row: {
          claim_date: string
          created_at: string
          device_id: string
          id: string
          issue: string | null
          service_center: string | null
          status: string
        }
        Insert: {
          claim_date?: string
          created_at?: string
          device_id: string
          id?: string
          issue?: string | null
          service_center?: string | null
          status?: string
        }
        Update: {
          claim_date?: string
          created_at?: string
          device_id?: string
          id?: string
          issue?: string | null
          service_center?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "claims_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          brand: string | null
          category: string | null
          created_at: string
          id: string
          image_url: string | null
          invoice_number: string | null
          model: string | null
          model_number: string | null
          name: string
          purchase_date: string | null
          purchase_price: number | null
          seller: string | null
          serial_number: string | null
          user_id: string
        }
        Insert: {
          brand?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          invoice_number?: string | null
          model?: string | null
          model_number?: string | null
          name: string
          purchase_date?: string | null
          purchase_price?: number | null
          seller?: string | null
          serial_number?: string | null
          user_id: string
        }
        Update: {
          brand?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          invoice_number?: string | null
          model?: string | null
          model_number?: string | null
          name?: string
          purchase_date?: string | null
          purchase_price?: number | null
          seller?: string | null
          serial_number?: string | null
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          device_id: string
          file_url: string | null
          id: string
          type: string
          uploaded_at: string
        }
        Insert: {
          device_id: string
          file_url?: string | null
          id?: string
          type?: string
          uploaded_at?: string
        }
        Update: {
          device_id?: string
          file_url?: string | null
          id?: string
          type?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          device_id: string | null
          id: string
          is_read: boolean
          link: string | null
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_id?: string | null
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          email_alerts: boolean
          id: string
          inapp_alerts: boolean
          name: string | null
          reminder_days: number
          theme: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          email_alerts?: boolean
          id: string
          inapp_alerts?: boolean
          name?: string | null
          reminder_days?: number
          theme?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          email_alerts?: boolean
          id?: string
          inapp_alerts?: boolean
          name?: string | null
          reminder_days?: number
          theme?: string
        }
        Relationships: []
      }
      service_history: {
        Row: {
          cost: number | null
          created_at: string
          date: string | null
          device_id: string
          id: string
          issue: string | null
          service_center: string | null
          status: string
        }
        Insert: {
          cost?: number | null
          created_at?: string
          date?: string | null
          device_id: string
          id?: string
          issue?: string | null
          service_center?: string | null
          status?: string
        }
        Update: {
          cost?: number | null
          created_at?: string
          date?: string | null
          device_id?: string
          id?: string
          issue?: string | null
          service_center?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_history_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      warranties: {
        Row: {
          created_at: string
          device_id: string
          end_date: string | null
          id: string
          notes: string | null
          start_date: string | null
          type: string
        }
        Insert: {
          created_at?: string
          device_id: string
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date?: string | null
          type?: string
        }
        Update: {
          created_at?: string
          device_id?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "warranties_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
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
