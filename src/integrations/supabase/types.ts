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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      awards: {
        Row: {
          allocation_percentage: number | null
          award_number: string
          award_type: string | null
          awarded_at: string | null
          awarded_by: string | null
          awarded_rate: number
          carrier_id: string
          created_at: string
          currency: string | null
          id: string
          is_locked: boolean | null
          lane_id: string
          quote_id: string
          rationale: string | null
          rfq_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          allocation_percentage?: number | null
          award_number: string
          award_type?: string | null
          awarded_at?: string | null
          awarded_by?: string | null
          awarded_rate: number
          carrier_id: string
          created_at?: string
          currency?: string | null
          id?: string
          is_locked?: boolean | null
          lane_id: string
          quote_id: string
          rationale?: string | null
          rfq_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          allocation_percentage?: number | null
          award_number?: string
          award_type?: string | null
          awarded_at?: string | null
          awarded_by?: string | null
          awarded_rate?: number
          carrier_id?: string
          created_at?: string
          currency?: string | null
          id?: string
          is_locked?: boolean | null
          lane_id?: string
          quote_id?: string
          rationale?: string | null
          rfq_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "awards_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "carriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "awards_lane_id_fkey"
            columns: ["lane_id"]
            isOneToOne: false
            referencedRelation: "rfq_lanes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "awards_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "awards_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
        ]
      }
      benchmark_rates: {
        Row: {
          avg_rate: number | null
          created_at: string
          currency: string | null
          destination: string
          equipment_type: string | null
          id: string
          max_rate: number | null
          min_rate: number | null
          mode: string
          origin: string
          period_end: string | null
          period_start: string | null
          sample_size: number | null
          updated_at: string
        }
        Insert: {
          avg_rate?: number | null
          created_at?: string
          currency?: string | null
          destination: string
          equipment_type?: string | null
          id?: string
          max_rate?: number | null
          min_rate?: number | null
          mode: string
          origin: string
          period_end?: string | null
          period_start?: string | null
          sample_size?: number | null
          updated_at?: string
        }
        Update: {
          avg_rate?: number | null
          created_at?: string
          currency?: string | null
          destination?: string
          equipment_type?: string | null
          id?: string
          max_rate?: number | null
          min_rate?: number | null
          mode?: string
          origin?: string
          period_end?: string | null
          period_start?: string | null
          sample_size?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      carriers: {
        Row: {
          code: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          rating: number | null
          supported_modes: string[] | null
          updated_at: string
        }
        Insert: {
          code: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          rating?: number | null
          supported_modes?: string[] | null
          updated_at?: string
        }
        Update: {
          code?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          rating?: number | null
          supported_modes?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      procurement_events: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          event_type: string
          id: string
          payload: Json | null
          processed: boolean | null
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          event_type: string
          id?: string
          payload?: Json | null
          processed?: boolean | null
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          event_type?: string
          id?: string
          payload?: Json | null
          processed?: boolean | null
        }
        Relationships: []
      }
      quote_versions: {
        Row: {
          base_freight_rate: number
          created_at: string
          id: string
          notes: string | null
          quote_id: string
          surcharges: Json | null
          total_landed_cost: number | null
          transit_time_days: number | null
          version: number
        }
        Insert: {
          base_freight_rate: number
          created_at?: string
          id?: string
          notes?: string | null
          quote_id: string
          surcharges?: Json | null
          total_landed_cost?: number | null
          transit_time_days?: number | null
          version: number
        }
        Update: {
          base_freight_rate?: number
          created_at?: string
          id?: string
          notes?: string | null
          quote_id?: string
          surcharges?: Json | null
          total_landed_cost?: number | null
          transit_time_days?: number | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_versions_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          base_freight_rate: number
          carrier_id: string
          created_at: string
          currency: string | null
          id: string
          lane_id: string
          notes: string | null
          quote_number: string
          quote_type: string | null
          rate_unit: string | null
          rfq_id: string
          status: string
          submitted_at: string | null
          surcharges: Json | null
          total_landed_cost: number | null
          transit_time_days: number | null
          updated_at: string
          validity_end: string | null
          validity_start: string | null
          version: number | null
        }
        Insert: {
          base_freight_rate: number
          carrier_id: string
          created_at?: string
          currency?: string | null
          id?: string
          lane_id: string
          notes?: string | null
          quote_number: string
          quote_type?: string | null
          rate_unit?: string | null
          rfq_id: string
          status?: string
          submitted_at?: string | null
          surcharges?: Json | null
          total_landed_cost?: number | null
          transit_time_days?: number | null
          updated_at?: string
          validity_end?: string | null
          validity_start?: string | null
          version?: number | null
        }
        Update: {
          base_freight_rate?: number
          carrier_id?: string
          created_at?: string
          currency?: string | null
          id?: string
          lane_id?: string
          notes?: string | null
          quote_number?: string
          quote_type?: string | null
          rate_unit?: string | null
          rfq_id?: string
          status?: string
          submitted_at?: string | null
          surcharges?: Json | null
          total_landed_cost?: number | null
          transit_time_days?: number | null
          updated_at?: string
          validity_end?: string | null
          validity_start?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "carriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_lane_id_fkey"
            columns: ["lane_id"]
            isOneToOne: false
            referencedRelation: "rfq_lanes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_cards: {
        Row: {
          award_id: string | null
          base_rate: number
          carrier_id: string
          created_at: string
          currency: string | null
          destination: string
          equipment_type: string | null
          id: string
          is_active: boolean | null
          lane_id: string
          metadata: Json | null
          mode: string
          origin: string
          rate_card_number: string
          rate_unit: string | null
          rfq_id: string | null
          surcharges: Json | null
          total_rate: number | null
          updated_at: string
          valid_from: string
          valid_to: string
        }
        Insert: {
          award_id?: string | null
          base_rate: number
          carrier_id: string
          created_at?: string
          currency?: string | null
          destination: string
          equipment_type?: string | null
          id?: string
          is_active?: boolean | null
          lane_id: string
          metadata?: Json | null
          mode: string
          origin: string
          rate_card_number: string
          rate_unit?: string | null
          rfq_id?: string | null
          surcharges?: Json | null
          total_rate?: number | null
          updated_at?: string
          valid_from: string
          valid_to: string
        }
        Update: {
          award_id?: string | null
          base_rate?: number
          carrier_id?: string
          created_at?: string
          currency?: string | null
          destination?: string
          equipment_type?: string | null
          id?: string
          is_active?: boolean | null
          lane_id?: string
          metadata?: Json | null
          mode?: string
          origin?: string
          rate_card_number?: string
          rate_unit?: string | null
          rfq_id?: string | null
          surcharges?: Json | null
          total_rate?: number | null
          updated_at?: string
          valid_from?: string
          valid_to?: string
        }
        Relationships: [
          {
            foreignKeyName: "rate_cards_award_id_fkey"
            columns: ["award_id"]
            isOneToOne: false
            referencedRelation: "awards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rate_cards_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "carriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rate_cards_lane_id_fkey"
            columns: ["lane_id"]
            isOneToOne: false
            referencedRelation: "rfq_lanes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rate_cards_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
        ]
      }
      rfq_lanes: {
        Row: {
          created_at: string
          destination_city: string
          destination_country: string
          destination_port_code: string | null
          equipment_type: string | null
          estimated_volume: string | null
          frequency: string | null
          id: string
          is_awarded: boolean | null
          lane_number: number
          origin_city: string
          origin_country: string
          origin_port_code: string | null
          rfq_id: string
          special_requirements: string | null
          volume_unit: string | null
        }
        Insert: {
          created_at?: string
          destination_city: string
          destination_country: string
          destination_port_code?: string | null
          equipment_type?: string | null
          estimated_volume?: string | null
          frequency?: string | null
          id?: string
          is_awarded?: boolean | null
          lane_number: number
          origin_city: string
          origin_country: string
          origin_port_code?: string | null
          rfq_id: string
          special_requirements?: string | null
          volume_unit?: string | null
        }
        Update: {
          created_at?: string
          destination_city?: string
          destination_country?: string
          destination_port_code?: string | null
          equipment_type?: string | null
          estimated_volume?: string | null
          frequency?: string | null
          id?: string
          is_awarded?: boolean | null
          lane_number?: number
          origin_city?: string
          origin_country?: string
          origin_port_code?: string | null
          rfq_id?: string
          special_requirements?: string | null
          volume_unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rfq_lanes_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
        ]
      }
      rfqs: {
        Row: {
          bid_deadline: string | null
          contract_duration_months: number | null
          created_at: string
          created_by: string | null
          estimated_annual_volume: string | null
          id: string
          incoterms: string | null
          metadata: Json | null
          mode: string
          notes: string | null
          rfq_number: string
          status: string
          title: string
          updated_at: string
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          bid_deadline?: string | null
          contract_duration_months?: number | null
          created_at?: string
          created_by?: string | null
          estimated_annual_volume?: string | null
          id?: string
          incoterms?: string | null
          metadata?: Json | null
          mode: string
          notes?: string | null
          rfq_number: string
          status?: string
          title: string
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          bid_deadline?: string | null
          contract_duration_months?: number | null
          created_at?: string
          created_by?: string | null
          estimated_annual_volume?: string | null
          id?: string
          incoterms?: string | null
          metadata?: Json | null
          mode?: string
          notes?: string | null
          rfq_number?: string
          status?: string
          title?: string
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      emit_procurement_event: {
        Args: {
          p_entity_id: string
          p_entity_type: string
          p_event_type: string
          p_payload?: Json
        }
        Returns: string
      }
      generate_award_number: { Args: never; Returns: string }
      generate_quote_number: { Args: never; Returns: string }
      generate_rate_card_number: { Args: never; Returns: string }
      generate_rfq_number: { Args: never; Returns: string }
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
