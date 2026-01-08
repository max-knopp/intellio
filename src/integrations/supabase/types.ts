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
      cargo_api_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          lead_id: string
          request_payload: Json
          response_body: string | null
          response_status: number | null
          success: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          lead_id: string
          request_payload: Json
          response_body?: string | null
          response_status?: number | null
          success?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          lead_id?: string
          request_payload?: Json
          response_body?: string | null
          response_status?: number | null
          success?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cargo_api_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_summary_log: {
        Row: {
          created_at: string
          hot_leads: number
          id: string
          summary_date: string
          total_actionable: number
          warm_leads: number
          webhook_status: number | null
        }
        Insert: {
          created_at?: string
          hot_leads: number
          id?: string
          summary_date: string
          total_actionable: number
          warm_leads: number
          webhook_status?: number | null
        }
        Update: {
          created_at?: string
          hot_leads?: number
          id?: string
          summary_date?: string
          total_actionable?: number
          warm_leads?: number
          webhook_status?: number | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          ai_comment: string | null
          ai_message: string
          company: string | null
          contact_name: string
          created_at: string
          final_comment: string | null
          final_message: string | null
          id: string
          linkedin_url: string
          notes: string | null
          org_id: string | null
          person_id: string
          position: string | null
          post_content: string | null
          post_date: string | null
          post_url: string | null
          profile_photo_url: string | null
          rejection_feedback: string | null
          relevance_score: number | null
          sent_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_comment?: string | null
          ai_message: string
          company?: string | null
          contact_name: string
          created_at?: string
          final_comment?: string | null
          final_message?: string | null
          id?: string
          linkedin_url: string
          notes?: string | null
          org_id?: string | null
          person_id: string
          position?: string | null
          post_content?: string | null
          post_date?: string | null
          post_url?: string | null
          profile_photo_url?: string | null
          rejection_feedback?: string | null
          relevance_score?: number | null
          sent_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_comment?: string | null
          ai_message?: string
          company?: string | null
          contact_name?: string
          created_at?: string
          final_comment?: string | null
          final_message?: string | null
          id?: string
          linkedin_url?: string
          notes?: string | null
          org_id?: string | null
          person_id?: string
          position?: string | null
          post_content?: string | null
          post_date?: string | null
          post_url?: string | null
          profile_photo_url?: string | null
          rejection_feedback?: string | null
          relevance_score?: number | null
          sent_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_members: {
        Row: {
          created_at: string
          id: string
          invited_by: string | null
          org_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by?: string | null
          org_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string | null
          org_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_org_id: { Args: { _user_id: string }; Returns: string }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
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
