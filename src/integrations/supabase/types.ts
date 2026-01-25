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
      auction_configs: {
        Row: {
          auction_end: string | null
          auction_start: string | null
          auction_type: string
          auto_award_enabled: boolean | null
          auto_extend_enabled: boolean | null
          auto_extend_minutes: number | null
          created_at: string
          current_round: number | null
          id: string
          max_rounds: number | null
          min_bid_decrement: number | null
          min_bid_decrement_type: string | null
          price_weight: number | null
          ranking_logic: string
          rfq_id: string
          structure: string
          transit_time_weight: number | null
          updated_at: string
        }
        Insert: {
          auction_end?: string | null
          auction_start?: string | null
          auction_type?: string
          auto_award_enabled?: boolean | null
          auto_extend_enabled?: boolean | null
          auto_extend_minutes?: number | null
          created_at?: string
          current_round?: number | null
          id?: string
          max_rounds?: number | null
          min_bid_decrement?: number | null
          min_bid_decrement_type?: string | null
          price_weight?: number | null
          ranking_logic?: string
          rfq_id: string
          structure?: string
          transit_time_weight?: number | null
          updated_at?: string
        }
        Update: {
          auction_end?: string | null
          auction_start?: string | null
          auction_type?: string
          auto_award_enabled?: boolean | null
          auto_extend_enabled?: boolean | null
          auto_extend_minutes?: number | null
          created_at?: string
          current_round?: number | null
          id?: string
          max_rounds?: number | null
          min_bid_decrement?: number | null
          min_bid_decrement_type?: string | null
          price_weight?: number | null
          ranking_logic?: string
          rfq_id?: string
          structure?: string
          transit_time_weight?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_configs_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: true
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
        ]
      }
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
      bids: {
        Row: {
          base_rate: number
          bid_number: string
          carrier_id: string
          created_at: string
          currency: string
          id: string
          is_active: boolean | null
          lane_id: string
          notes: string | null
          rate_unit: string | null
          rfq_id: string
          round_number: number
          status: string
          submitted_at: string
          surcharges: Json | null
          total_landed_cost: number
          transit_time_days: number | null
          updated_at: string
          validity_end: string | null
          validity_start: string | null
          version: number
        }
        Insert: {
          base_rate: number
          bid_number: string
          carrier_id: string
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean | null
          lane_id: string
          notes?: string | null
          rate_unit?: string | null
          rfq_id: string
          round_number?: number
          status?: string
          submitted_at?: string
          surcharges?: Json | null
          total_landed_cost: number
          transit_time_days?: number | null
          updated_at?: string
          validity_end?: string | null
          validity_start?: string | null
          version?: number
        }
        Update: {
          base_rate?: number
          bid_number?: string
          carrier_id?: string
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean | null
          lane_id?: string
          notes?: string | null
          rate_unit?: string | null
          rfq_id?: string
          round_number?: number
          status?: string
          submitted_at?: string
          surcharges?: Json | null
          total_landed_cost?: number
          transit_time_days?: number | null
          updated_at?: string
          validity_end?: string | null
          validity_start?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "bids_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "carriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_lane_id_fkey"
            columns: ["lane_id"]
            isOneToOne: false
            referencedRelation: "rfq_lanes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
        ]
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
      consignees: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          code: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          id: string
          is_active: boolean
          metadata: Json | null
          name: string
          port_code: string | null
          postal_code: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          code?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name: string
          port_code?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          code?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name?: string
          port_code?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          billing_address: string | null
          city: string | null
          code: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          id: string
          is_active: boolean
          metadata: Json | null
          name: string
          postal_code: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          billing_address?: string | null
          city?: string | null
          code?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name: string
          postal_code?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          billing_address?: string | null
          city?: string | null
          code?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name?: string
          postal_code?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      document_comments: {
        Row: {
          content: string
          created_at: string
          document_id: string
          id: string
          is_resolved: boolean | null
          parent_comment_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          updated_at: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          content: string
          created_at?: string
          document_id: string
          id?: string
          is_resolved?: boolean | null
          parent_comment_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          document_id?: string
          id?: string
          is_resolved?: boolean | null
          parent_comment_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_comments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "document_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      document_events: {
        Row: {
          created_at: string
          document_id: string
          event_data: Json | null
          event_type: string
          id: string
          processed: boolean | null
          processed_at: string | null
          triggered_by: string | null
          triggered_by_system: string | null
        }
        Insert: {
          created_at?: string
          document_id: string
          event_data?: Json | null
          event_type: string
          id?: string
          processed?: boolean | null
          processed_at?: string | null
          triggered_by?: string | null
          triggered_by_system?: string | null
        }
        Update: {
          created_at?: string
          document_id?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          processed?: boolean | null
          processed_at?: string | null
          triggered_by?: string | null
          triggered_by_system?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_events_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          country_code: string | null
          created_at: string
          created_by: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          id: string
          incoterms: string[] | null
          is_active: boolean | null
          is_default: boolean | null
          template_data: Json
          template_name: string
          updated_at: string
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          id?: string
          incoterms?: string[] | null
          is_active?: boolean | null
          is_default?: boolean | null
          template_data: Json
          template_name: string
          updated_at?: string
        }
        Update: {
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          id?: string
          incoterms?: string[] | null
          is_active?: boolean | null
          is_default?: boolean | null
          template_data?: Json
          template_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_validation_rules: {
        Row: {
          applies_to_countries: string[] | null
          applies_to_incoterms: string[] | null
          created_at: string
          document_type: Database["public"]["Enums"]["document_type"]
          id: string
          is_active: boolean | null
          rule_config: Json
          rule_name: string
          rule_type: string
          severity: string
        }
        Insert: {
          applies_to_countries?: string[] | null
          applies_to_incoterms?: string[] | null
          created_at?: string
          document_type: Database["public"]["Enums"]["document_type"]
          id?: string
          is_active?: boolean | null
          rule_config: Json
          rule_name: string
          rule_type: string
          severity?: string
        }
        Update: {
          applies_to_countries?: string[] | null
          applies_to_incoterms?: string[] | null
          created_at?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          id?: string
          is_active?: boolean | null
          rule_config?: Json
          rule_name?: string
          rule_type?: string
          severity?: string
        }
        Relationships: []
      }
      document_versions: {
        Row: {
          change_reason: string | null
          changed_by: string | null
          changes_summary: string | null
          content_data: Json
          created_at: string
          document_id: string
          file_url: string | null
          id: string
          version: number
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string | null
          changes_summary?: string | null
          content_data: Json
          created_at?: string
          document_id: string
          file_url?: string | null
          id?: string
          version: number
        }
        Update: {
          change_reason?: string | null
          changed_by?: string | null
          changes_summary?: string | null
          content_data?: Json
          created_at?: string
          document_id?: string
          file_url?: string | null
          id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          content_data: Json | null
          country_of_origin: string | null
          created_at: string
          created_by: string | null
          destination_country: string | null
          document_name: string
          document_number: string
          document_type: Database["public"]["Enums"]["document_type"]
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          incoterms: string | null
          is_latest: boolean | null
          metadata: Json | null
          notes: string | null
          order_id: string | null
          parent_document_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_score: number | null
          shipment_id: string | null
          status: Database["public"]["Enums"]["document_status"]
          submitted_at: string | null
          submitted_by: string | null
          template_id: string | null
          updated_at: string
          uploaded_by: string | null
          validation_errors: Json | null
          validation_status: string | null
          validation_warnings: Json | null
          version: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          content_data?: Json | null
          country_of_origin?: string | null
          created_at?: string
          created_by?: string | null
          destination_country?: string | null
          document_name: string
          document_number: string
          document_type: Database["public"]["Enums"]["document_type"]
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          incoterms?: string | null
          is_latest?: boolean | null
          metadata?: Json | null
          notes?: string | null
          order_id?: string | null
          parent_document_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_score?: number | null
          shipment_id?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          template_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
          validation_errors?: Json | null
          validation_status?: string | null
          validation_warnings?: Json | null
          version?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          content_data?: Json | null
          country_of_origin?: string | null
          created_at?: string
          created_by?: string | null
          destination_country?: string | null
          document_name?: string
          document_number?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          incoterms?: string | null
          is_latest?: boolean | null
          metadata?: Json | null
          notes?: string | null
          order_id?: string | null
          parent_document_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_score?: number | null
          shipment_id?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          template_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
          validation_errors?: Json | null
          validation_status?: string | null
          validation_warnings?: Json | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_parent_document_id_fkey"
            columns: ["parent_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      lane_rankings: {
        Row: {
          bid_id: string | null
          carrier_id: string
          computed_at: string
          id: string
          lane_id: string
          rank: number
          rfq_id: string
          round_number: number | null
          score: number | null
          total_vendors: number
        }
        Insert: {
          bid_id?: string | null
          carrier_id: string
          computed_at?: string
          id?: string
          lane_id: string
          rank: number
          rfq_id: string
          round_number?: number | null
          score?: number | null
          total_vendors: number
        }
        Update: {
          bid_id?: string | null
          carrier_id?: string
          computed_at?: string
          id?: string
          lane_id?: string
          rank?: number
          rfq_id?: string
          round_number?: number | null
          score?: number | null
          total_vendors?: number
        }
        Relationships: [
          {
            foreignKeyName: "lane_rankings_bid_id_fkey"
            columns: ["bid_id"]
            isOneToOne: false
            referencedRelation: "bids"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lane_rankings_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "carriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lane_rankings_lane_id_fkey"
            columns: ["lane_id"]
            isOneToOne: false
            referencedRelation: "rfq_lanes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lane_rankings_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
        ]
      }
      order_documents: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          document_name: string
          document_type: string
          file_url: string | null
          id: string
          metadata: Json | null
          order_id: string
          status: string | null
          updated_at: string
          uploaded_by: string | null
          version: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          document_name: string
          document_type: string
          file_url?: string | null
          id?: string
          metadata?: Json | null
          order_id: string
          status?: string | null
          updated_at?: string
          uploaded_by?: string | null
          version?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          document_name?: string
          document_type?: string
          file_url?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string
          status?: string | null
          updated_at?: string
          uploaded_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_documents_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          order_id: string
          processed: boolean | null
          processed_at: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          order_id: string
          processed?: boolean | null
          processed_at?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          order_id?: string
          processed?: boolean | null
          processed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_shipments: {
        Row: {
          allocated_quantity: number | null
          allocated_volume: number | null
          allocated_weight: number | null
          created_at: string
          id: string
          is_primary: boolean | null
          notes: string | null
          order_id: string
          shipment_id: string
          shipment_status: string | null
          updated_at: string
        }
        Insert: {
          allocated_quantity?: number | null
          allocated_volume?: number | null
          allocated_weight?: number | null
          created_at?: string
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          order_id: string
          shipment_id: string
          shipment_status?: string | null
          updated_at?: string
        }
        Update: {
          allocated_quantity?: number | null
          allocated_volume?: number | null
          allocated_weight?: number | null
          created_at?: string
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          order_id?: string
          shipment_id?: string
          shipment_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_state_transitions: {
        Row: {
          created_at: string
          from_status: Database["public"]["Enums"]["order_status"] | null
          id: string
          metadata: Json | null
          notes: string | null
          order_id: string
          to_status: Database["public"]["Enums"]["order_status"]
          triggered_by: string | null
          triggered_by_system: string | null
        }
        Insert: {
          created_at?: string
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_id: string
          to_status: Database["public"]["Enums"]["order_status"]
          triggered_by?: string | null
          triggered_by_system?: string | null
        }
        Update: {
          created_at?: string
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_id?: string
          to_status?: Database["public"]["Enums"]["order_status"]
          triggered_by?: string | null
          triggered_by_system?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_state_transitions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_versions: {
        Row: {
          change_reason: string | null
          changed_by: string | null
          changes: Json
          created_at: string
          id: string
          new_state: Json
          order_id: string
          previous_state: Json
          version: number
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string | null
          changes: Json
          created_at?: string
          id?: string
          new_state: Json
          order_id: string
          previous_state: Json
          version: number
        }
        Update: {
          change_reason?: string | null
          changed_by?: string | null
          changes?: Json
          created_at?: string
          id?: string
          new_state?: Json
          order_id?: string
          previous_state?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_versions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          actual_delivery_date: string | null
          actual_pickup_date: string | null
          ai_recommendations: Json | null
          commodity_description: string | null
          confirmed_delivery_date: string | null
          confirmed_pickup_date: string | null
          consignee_id: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          customer_reference: string | null
          destination_address: string | null
          destination_city: string | null
          destination_country: string | null
          destination_port_code: string | null
          hs_code: string | null
          id: string
          incoterms: string | null
          internal_reference: string | null
          metadata: Json | null
          mode: string | null
          notes: string | null
          order_number: string
          order_type: Database["public"]["Enums"]["order_type"]
          origin_address: string | null
          origin_city: string | null
          origin_country: string | null
          origin_port_code: string | null
          po_number: string | null
          quantity: number | null
          quantity_unit: string | null
          requested_delivery_date: string | null
          requested_pickup_date: string | null
          risk_factors: Json | null
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          risk_score: number | null
          service_level: string | null
          shipper_id: string | null
          sku_code: string | null
          so_number: string | null
          status: Database["public"]["Enums"]["order_status"]
          updated_at: string
          version: number | null
          volume_unit: string | null
          volume_value: number | null
          weight_unit: string | null
          weight_value: number | null
        }
        Insert: {
          actual_delivery_date?: string | null
          actual_pickup_date?: string | null
          ai_recommendations?: Json | null
          commodity_description?: string | null
          confirmed_delivery_date?: string | null
          confirmed_pickup_date?: string | null
          consignee_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          customer_reference?: string | null
          destination_address?: string | null
          destination_city?: string | null
          destination_country?: string | null
          destination_port_code?: string | null
          hs_code?: string | null
          id?: string
          incoterms?: string | null
          internal_reference?: string | null
          metadata?: Json | null
          mode?: string | null
          notes?: string | null
          order_number: string
          order_type?: Database["public"]["Enums"]["order_type"]
          origin_address?: string | null
          origin_city?: string | null
          origin_country?: string | null
          origin_port_code?: string | null
          po_number?: string | null
          quantity?: number | null
          quantity_unit?: string | null
          requested_delivery_date?: string | null
          requested_pickup_date?: string | null
          risk_factors?: Json | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          risk_score?: number | null
          service_level?: string | null
          shipper_id?: string | null
          sku_code?: string | null
          so_number?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
          version?: number | null
          volume_unit?: string | null
          volume_value?: number | null
          weight_unit?: string | null
          weight_value?: number | null
        }
        Update: {
          actual_delivery_date?: string | null
          actual_pickup_date?: string | null
          ai_recommendations?: Json | null
          commodity_description?: string | null
          confirmed_delivery_date?: string | null
          confirmed_pickup_date?: string | null
          consignee_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          customer_reference?: string | null
          destination_address?: string | null
          destination_city?: string | null
          destination_country?: string | null
          destination_port_code?: string | null
          hs_code?: string | null
          id?: string
          incoterms?: string | null
          internal_reference?: string | null
          metadata?: Json | null
          mode?: string | null
          notes?: string | null
          order_number?: string
          order_type?: Database["public"]["Enums"]["order_type"]
          origin_address?: string | null
          origin_city?: string | null
          origin_country?: string | null
          origin_port_code?: string | null
          po_number?: string | null
          quantity?: number | null
          quantity_unit?: string | null
          requested_delivery_date?: string | null
          requested_pickup_date?: string | null
          risk_factors?: Json | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          risk_score?: number | null
          service_level?: string | null
          shipper_id?: string | null
          sku_code?: string | null
          so_number?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
          version?: number | null
          volume_unit?: string | null
          volume_value?: number | null
          weight_unit?: string | null
          weight_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_consignee_id_fkey"
            columns: ["consignee_id"]
            isOneToOne: false
            referencedRelation: "consignees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shipper_id_fkey"
            columns: ["shipper_id"]
            isOneToOne: false
            referencedRelation: "shippers"
            referencedColumns: ["id"]
          },
        ]
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
      profiles: {
        Row: {
          carrier_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          carrier_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          carrier_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "carriers"
            referencedColumns: ["id"]
          },
        ]
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
      rank_snapshots: {
        Row: {
          id: string
          lane_id: string
          rankings: Json
          rfq_id: string
          round_number: number
          snapshot_at: string
        }
        Insert: {
          id?: string
          lane_id: string
          rankings: Json
          rfq_id: string
          round_number?: number
          snapshot_at?: string
        }
        Update: {
          id?: string
          lane_id?: string
          rankings?: Json
          rfq_id?: string
          round_number?: number
          snapshot_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rank_snapshots_lane_id_fkey"
            columns: ["lane_id"]
            isOneToOne: false
            referencedRelation: "rfq_lanes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rank_snapshots_rfq_id_fkey"
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
          consignee_id: string | null
          created_at: string
          destination_address: string | null
          destination_city: string
          destination_country: string
          destination_port: string | null
          destination_port_code: string | null
          dimensions_height: number | null
          dimensions_length: number | null
          dimensions_unit: string | null
          dimensions_width: number | null
          equipment_type: string | null
          estimated_volume: string | null
          frequency: string | null
          id: string
          is_awarded: boolean | null
          lane_number: number
          origin_address: string | null
          origin_city: string
          origin_country: string
          origin_port: string | null
          origin_port_code: string | null
          package_type: string | null
          quantity: number | null
          quantity_unit: string | null
          rfq_id: string
          shipper_id: string | null
          special_requirements: string | null
          volume_cbm: number | null
          volume_unit: string | null
          volume_value: number | null
          weight_unit: string | null
          weight_value: number | null
        }
        Insert: {
          consignee_id?: string | null
          created_at?: string
          destination_address?: string | null
          destination_city: string
          destination_country: string
          destination_port?: string | null
          destination_port_code?: string | null
          dimensions_height?: number | null
          dimensions_length?: number | null
          dimensions_unit?: string | null
          dimensions_width?: number | null
          equipment_type?: string | null
          estimated_volume?: string | null
          frequency?: string | null
          id?: string
          is_awarded?: boolean | null
          lane_number: number
          origin_address?: string | null
          origin_city: string
          origin_country: string
          origin_port?: string | null
          origin_port_code?: string | null
          package_type?: string | null
          quantity?: number | null
          quantity_unit?: string | null
          rfq_id: string
          shipper_id?: string | null
          special_requirements?: string | null
          volume_cbm?: number | null
          volume_unit?: string | null
          volume_value?: number | null
          weight_unit?: string | null
          weight_value?: number | null
        }
        Update: {
          consignee_id?: string | null
          created_at?: string
          destination_address?: string | null
          destination_city?: string
          destination_country?: string
          destination_port?: string | null
          destination_port_code?: string | null
          dimensions_height?: number | null
          dimensions_length?: number | null
          dimensions_unit?: string | null
          dimensions_width?: number | null
          equipment_type?: string | null
          estimated_volume?: string | null
          frequency?: string | null
          id?: string
          is_awarded?: boolean | null
          lane_number?: number
          origin_address?: string | null
          origin_city?: string
          origin_country?: string
          origin_port?: string | null
          origin_port_code?: string | null
          package_type?: string | null
          quantity?: number | null
          quantity_unit?: string | null
          rfq_id?: string
          shipper_id?: string | null
          special_requirements?: string | null
          volume_cbm?: number | null
          volume_unit?: string | null
          volume_value?: number | null
          weight_unit?: string | null
          weight_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rfq_lanes_consignee_id_fkey"
            columns: ["consignee_id"]
            isOneToOne: false
            referencedRelation: "consignees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_lanes_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_lanes_shipper_id_fkey"
            columns: ["shipper_id"]
            isOneToOne: false
            referencedRelation: "shippers"
            referencedColumns: ["id"]
          },
        ]
      }
      rfqs: {
        Row: {
          auction_status: string | null
          bid_deadline: string | null
          cargo_description: string | null
          cargo_type: string | null
          consignee_id: string | null
          contract_duration_months: number | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          estimated_annual_volume: string | null
          id: string
          incoterms: string | null
          metadata: Json | null
          mode: string
          notes: string | null
          pickup_date: string | null
          po_number: string | null
          rfq_number: string
          rfq_type: string | null
          shipper_id: string | null
          so_number: string | null
          status: string
          title: string
          updated_at: string
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          auction_status?: string | null
          bid_deadline?: string | null
          cargo_description?: string | null
          cargo_type?: string | null
          consignee_id?: string | null
          contract_duration_months?: number | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          estimated_annual_volume?: string | null
          id?: string
          incoterms?: string | null
          metadata?: Json | null
          mode: string
          notes?: string | null
          pickup_date?: string | null
          po_number?: string | null
          rfq_number: string
          rfq_type?: string | null
          shipper_id?: string | null
          so_number?: string | null
          status?: string
          title: string
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          auction_status?: string | null
          bid_deadline?: string | null
          cargo_description?: string | null
          cargo_type?: string | null
          consignee_id?: string | null
          contract_duration_months?: number | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          estimated_annual_volume?: string | null
          id?: string
          incoterms?: string | null
          metadata?: Json | null
          mode?: string
          notes?: string | null
          pickup_date?: string | null
          po_number?: string | null
          rfq_number?: string
          rfq_type?: string | null
          shipper_id?: string | null
          so_number?: string | null
          status?: string
          title?: string
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rfqs_consignee_id_fkey"
            columns: ["consignee_id"]
            isOneToOne: false
            referencedRelation: "consignees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfqs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfqs_shipper_id_fkey"
            columns: ["shipper_id"]
            isOneToOne: false
            referencedRelation: "shippers"
            referencedColumns: ["id"]
          },
        ]
      }
      shippers: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          code: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          id: string
          is_active: boolean
          metadata: Json | null
          name: string
          port_code: string | null
          postal_code: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          code?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name: string
          port_code?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          code?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name?: string
          port_code?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      vendor_invitations: {
        Row: {
          accepted_at: string | null
          carrier_id: string
          declined_at: string | null
          id: string
          invited_at: string
          rfq_id: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          carrier_id: string
          declined_at?: string | null
          id?: string
          invited_at?: string
          rfq_id: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          carrier_id?: string
          declined_at?: string | null
          id?: string
          invited_at?: string
          rfq_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_invitations_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "carriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_invitations_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      compute_lane_rankings: {
        Args: { p_lane_id: string; p_rfq_id: string; p_round?: number }
        Returns: undefined
      }
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
      generate_bid_number: { Args: never; Returns: string }
      generate_document_number: { Args: never; Returns: string }
      generate_order_number: { Args: never; Returns: string }
      generate_quote_number: { Args: never; Returns: string }
      generate_rate_card_number: { Args: never; Returns: string }
      generate_rfq_number: { Args: never; Returns: string }
    }
    Enums: {
      document_status:
        | "draft"
        | "pending_review"
        | "reviewed"
        | "approved"
        | "submitted"
        | "rejected"
      document_type:
        | "commercial_invoice"
        | "packing_list"
        | "bill_of_lading"
        | "airway_bill"
        | "shipping_instructions"
        | "certificate_of_origin"
        | "insurance_certificate"
        | "proof_of_delivery"
        | "customs_declaration"
        | "inspection_certificate"
        | "other"
      order_status:
        | "created"
        | "confirmed"
        | "ready_to_ship"
        | "booked"
        | "in_transit"
        | "delivered"
        | "closed"
        | "cancelled"
      order_type: "purchase_order" | "sales_order" | "transport_order"
      risk_level: "low" | "medium" | "high" | "critical"
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
      document_status: [
        "draft",
        "pending_review",
        "reviewed",
        "approved",
        "submitted",
        "rejected",
      ],
      document_type: [
        "commercial_invoice",
        "packing_list",
        "bill_of_lading",
        "airway_bill",
        "shipping_instructions",
        "certificate_of_origin",
        "insurance_certificate",
        "proof_of_delivery",
        "customs_declaration",
        "inspection_certificate",
        "other",
      ],
      order_status: [
        "created",
        "confirmed",
        "ready_to_ship",
        "booked",
        "in_transit",
        "delivered",
        "closed",
        "cancelled",
      ],
      order_type: ["purchase_order", "sales_order", "transport_order"],
      risk_level: ["low", "medium", "high", "critical"],
    },
  },
} as const
