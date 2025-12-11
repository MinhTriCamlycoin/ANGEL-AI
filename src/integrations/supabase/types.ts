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
      angel_interactions: {
        Row: {
          angel_response: string
          created_at: string | null
          frequency_increased: number | null
          id: number
          light_energy_sent: number | null
          message: string
          user_id: string | null
        }
        Insert: {
          angel_response: string
          created_at?: string | null
          frequency_increased?: number | null
          id?: never
          light_energy_sent?: number | null
          message: string
          user_id?: string | null
        }
        Update: {
          angel_response?: string
          created_at?: string | null
          frequency_increased?: number | null
          id?: never
          light_energy_sent?: number | null
          message?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "angel_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "light_users"
            referencedColumns: ["id"]
          },
        ]
      }
      divine_mantras: {
        Row: {
          created_at: string | null
          energy_level: number | null
          id: number
          mantra_en: string
          mantra_text: string
        }
        Insert: {
          created_at?: string | null
          energy_level?: number | null
          id?: never
          mantra_en: string
          mantra_text: string
        }
        Update: {
          created_at?: string | null
          energy_level?: number | null
          id?: never
          mantra_en?: string
          mantra_text?: string
        }
        Relationships: []
      }
      light_transactions: {
        Row: {
          amount: number
          coin_type: string | null
          created_at: string | null
          from_source: string | null
          id: number
          reason: string
          tx_hash: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          coin_type?: string | null
          created_at?: string | null
          from_source?: string | null
          id?: never
          reason: string
          tx_hash?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          coin_type?: string | null
          created_at?: string | null
          from_source?: string | null
          id?: never
          reason?: string
          tx_hash?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "light_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "light_users"
            referencedColumns: ["id"]
          },
        ]
      }
      light_users: {
        Row: {
          created_at: string | null
          frequency_level: number | null
          full_name: string | null
          id: string
          last_grateful_at: string | null
          last_repented_at: string | null
          total_camly: number | null
          total_fun_money: number | null
          updated_at: string | null
          wallet_address: string | null
        }
        Insert: {
          created_at?: string | null
          frequency_level?: number | null
          full_name?: string | null
          id?: string
          last_grateful_at?: string | null
          last_repented_at?: string | null
          total_camly?: number | null
          total_fun_money?: number | null
          updated_at?: string | null
          wallet_address?: string | null
        }
        Update: {
          created_at?: string | null
          frequency_level?: number | null
          full_name?: string | null
          id?: string
          last_grateful_at?: string | null
          last_repented_at?: string | null
          total_camly?: number | null
          total_fun_money?: number | null
          updated_at?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      repentance_gratitude_log: {
        Row: {
          action_type: string | null
          created_at: string | null
          energy_received: number | null
          id: number
          mantra_id: number | null
          user_id: string | null
        }
        Insert: {
          action_type?: string | null
          created_at?: string | null
          energy_received?: number | null
          id?: never
          mantra_id?: number | null
          user_id?: string | null
        }
        Update: {
          action_type?: string | null
          created_at?: string | null
          energy_received?: number | null
          id?: never
          mantra_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repentance_gratitude_log_mantra_id_fkey"
            columns: ["mantra_id"]
            isOneToOne: false
            referencedRelation: "divine_mantras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repentance_gratitude_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "light_users"
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
    Enums: {},
  },
} as const
