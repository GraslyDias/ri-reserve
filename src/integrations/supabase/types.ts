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
      confirmed_bookings: {
        Row: {
          booking_date: string
          booking_time: string
          created_at: string
          customer_name: string
          id: string
          inquiry_id: string | null
          max_capacity: number
          package_id: string | null
          package_name: string
          package_type: Database["public"]["Enums"]["package_type"]
          participants: number
          status: string
        }
        Insert: {
          booking_date: string
          booking_time: string
          created_at?: string
          customer_name: string
          id?: string
          inquiry_id?: string | null
          max_capacity?: number
          package_id?: string | null
          package_name: string
          package_type: Database["public"]["Enums"]["package_type"]
          participants?: number
          status?: string
        }
        Update: {
          booking_date?: string
          booking_time?: string
          created_at?: string
          customer_name?: string
          id?: string
          inquiry_id?: string | null
          max_capacity?: number
          package_id?: string | null
          package_name?: string
          package_type?: Database["public"]["Enums"]["package_type"]
          participants?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "confirmed_bookings_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "confirmed_bookings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          admin_notes: string | null
          created_at: string
          customer_name: string
          email: string | null
          id: string
          package_id: string | null
          package_name: string
          package_type: Database["public"]["Enums"]["package_type"]
          participants: number
          payment_method: Database["public"]["Enums"]["payment_method"]
          phone: string
          preferred_date: string
          preferred_time: string
          special_requirements: string | null
          status: Database["public"]["Enums"]["inquiry_status"]
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          customer_name: string
          email?: string | null
          id?: string
          package_id?: string | null
          package_name: string
          package_type?: Database["public"]["Enums"]["package_type"]
          participants?: number
          payment_method?: Database["public"]["Enums"]["payment_method"]
          phone: string
          preferred_date: string
          preferred_time: string
          special_requirements?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          customer_name?: string
          email?: string | null
          id?: string
          package_id?: string | null
          package_name?: string
          package_type?: Database["public"]["Enums"]["package_type"]
          participants?: number
          payment_method?: Database["public"]["Enums"]["payment_method"]
          phone?: string
          preferred_date?: string
          preferred_time?: string
          special_requirements?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          benefits: string[]
          category: Database["public"]["Enums"]["package_category"]
          created_at: string
          description: string
          discount_percent: number | null
          display_order: number
          duration_minutes: number
          id: string
          is_active: boolean
          max_capacity: number | null
          name: string
          price_lkr: number | null
          type: Database["public"]["Enums"]["package_type"]
        }
        Insert: {
          benefits?: string[]
          category: Database["public"]["Enums"]["package_category"]
          created_at?: string
          description: string
          discount_percent?: number | null
          display_order?: number
          duration_minutes?: number
          id?: string
          is_active?: boolean
          max_capacity?: number | null
          name: string
          price_lkr?: number | null
          type?: Database["public"]["Enums"]["package_type"]
        }
        Update: {
          benefits?: string[]
          category?: Database["public"]["Enums"]["package_category"]
          created_at?: string
          description?: string
          discount_percent?: number | null
          display_order?: number
          duration_minutes?: number
          id?: string
          is_active?: boolean
          max_capacity?: number | null
          name?: string
          price_lkr?: number | null
          type?: Database["public"]["Enums"]["package_type"]
        }
        Relationships: []
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
      app_role: "admin" | "user"
      inquiry_status:
        | "new"
        | "contacted"
        | "payment_pending"
        | "payment_received"
        | "confirmed"
        | "completed"
        | "cancelled"
      package_category: "yoga" | "massage" | "counselling" | "therapy" | "mixed"
      package_type: "individual" | "group"
      payment_method: "no_payment" | "bank_transfer"
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
      app_role: ["admin", "user"],
      inquiry_status: [
        "new",
        "contacted",
        "payment_pending",
        "payment_received",
        "confirmed",
        "completed",
        "cancelled",
      ],
      package_category: ["yoga", "massage", "counselling", "therapy", "mixed"],
      package_type: ["individual", "group"],
      payment_method: ["no_payment", "bank_transfer"],
    },
  },
} as const
