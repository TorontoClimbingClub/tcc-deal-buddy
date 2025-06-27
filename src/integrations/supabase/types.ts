export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cart_items: {
        Row: {
          added_at: string | null
          id: string
          merchant_id: number
          product_sku: string
          quantity: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          added_at?: string | null
          id?: string
          merchant_id: number
          product_sku: string
          quantity?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          added_at?: string | null
          id?: string
          merchant_id?: number
          product_sku?: string
          quantity?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      price_history: {
        Row: {
          created_at: string | null
          discount_percent: number | null
          id: string
          is_sale: boolean
          merchant_id: number
          price: number
          product_sku: string
          recorded_date: string
        }
        Insert: {
          created_at?: string | null
          discount_percent?: number | null
          id?: string
          is_sale?: boolean
          merchant_id: number
          price: number
          product_sku: string
          recorded_date?: string
        }
        Update: {
          created_at?: string | null
          discount_percent?: number | null
          id?: string
          is_sale?: boolean
          merchant_id?: number
          price?: number
          product_sku?: string
          recorded_date?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          availability_score: number | null
          brand_name: string | null
          buy_url: string | null
          category: string | null
          created_at: string | null
          description: string | null
          discount_amount: number | null
          discount_percent: number | null
          id: string
          image_url: string | null
          last_sync_date: string
          merchant_id: number
          merchant_name: string
          name: string
          retail_price: number | null
          sale_price: number | null
          sku: string
          subcategory: string | null
          sync_priority: number | null
          updated_at: string | null
        }
        Insert: {
          availability_score?: number | null
          brand_name?: string | null
          buy_url?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          image_url?: string | null
          last_sync_date?: string
          merchant_id: number
          merchant_name: string
          name: string
          retail_price?: number | null
          sale_price?: number | null
          sku: string
          subcategory?: string | null
          sync_priority?: number | null
          updated_at?: string | null
        }
        Update: {
          availability_score?: number | null
          brand_name?: string | null
          buy_url?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          image_url?: string | null
          last_sync_date?: string
          merchant_id?: number
          merchant_name?: string
          name?: string
          retail_price?: number | null
          sale_price?: number | null
          sku?: string
          subcategory?: string | null
          sync_priority?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sku_api_tracking: {
        Row: {
          api_call_count: number | null
          created_at: string | null
          error_message: string | null
          id: string
          last_api_call: string | null
          last_successful_call: string | null
          merchant_id: number
          sku: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          api_call_count?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_api_call?: string | null
          last_successful_call?: string | null
          merchant_id: number
          sku: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          api_call_count?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_api_call?: string | null
          last_successful_call?: string | null
          merchant_id?: number
          sku?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sync_jobs: {
        Row: {
          api_calls_used: number | null
          avg_processing_time_ms: number | null
          categories_synced: string[] | null
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          job_subtype: string | null
          job_type: string
          merchant_ids: number[] | null
          price_history_entries: number | null
          products_added: number | null
          products_updated: number | null
          records_processed: number | null
          started_at: string | null
          status: string
          sync_date: string
          updated_at: string | null
        }
        Insert: {
          api_calls_used?: number | null
          avg_processing_time_ms?: number | null
          categories_synced?: string[] | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_subtype?: string | null
          job_type: string
          merchant_ids?: number[] | null
          price_history_entries?: number | null
          products_added?: number | null
          products_updated?: number | null
          records_processed?: number | null
          started_at?: string | null
          status?: string
          sync_date?: string
          updated_at?: string | null
        }
        Update: {
          api_calls_used?: number | null
          avg_processing_time_ms?: number | null
          categories_synced?: string[] | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_subtype?: string | null
          job_type?: string
          merchant_ids?: number[] | null
          price_history_entries?: number | null
          products_added?: number | null
          products_updated?: number | null
          records_processed?: number | null
          started_at?: string | null
          status?: string
          sync_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sync_queue: {
        Row: {
          api_calls_used: number | null
          created_at: string | null
          error_message: string | null
          id: string
          merchant_id: number
          priority: number | null
          processed_at: string | null
          product_sku: string
          requested_by_user_id: string | null
          scheduled_for: string | null
          status: string | null
          sync_type: string
        }
        Insert: {
          api_calls_used?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          merchant_id: number
          priority?: number | null
          processed_at?: string | null
          product_sku: string
          requested_by_user_id?: string | null
          scheduled_for?: string | null
          status?: string | null
          sync_type: string
        }
        Update: {
          api_calls_used?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          merchant_id?: number
          priority?: number | null
          processed_at?: string | null
          product_sku?: string
          requested_by_user_id?: string | null
          scheduled_for?: string | null
          status?: string | null
          sync_type?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          merchant_id: number
          product_sku: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          merchant_id: number
          product_sku: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          merchant_id?: number
          product_sku?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      current_deals: {
        Row: {
          availability_score: number | null
          brand_name: string | null
          buy_url: string | null
          calculated_discount_percent: number | null
          category: string | null
          created_at: string | null
          description: string | null
          discount_amount: number | null
          discount_percent: number | null
          id: string | null
          image_url: string | null
          last_sync_date: string | null
          merchant_id: number | null
          merchant_name: string | null
          name: string | null
          retail_price: number | null
          sale_price: number | null
          sku: string | null
          subcategory: string | null
          sync_priority: number | null
          updated_at: string | null
        }
        Insert: {
          availability_score?: number | null
          brand_name?: string | null
          buy_url?: string | null
          calculated_discount_percent?: never
          category?: string | null
          created_at?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string | null
          image_url?: string | null
          last_sync_date?: string | null
          merchant_id?: number | null
          merchant_name?: string | null
          name?: string | null
          retail_price?: number | null
          sale_price?: number | null
          sku?: string | null
          subcategory?: string | null
          sync_priority?: number | null
          updated_at?: string | null
        }
        Update: {
          availability_score?: number | null
          brand_name?: string | null
          buy_url?: string | null
          calculated_discount_percent?: never
          category?: string | null
          created_at?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string | null
          image_url?: string | null
          last_sync_date?: string | null
          merchant_id?: number | null
          merchant_name?: string | null
          name?: string | null
          retail_price?: number | null
          sale_price?: number | null
          sku?: string | null
          subcategory?: string | null
          sync_priority?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      price_sync_progress: {
        Row: {
          completed: number | null
          completion_percentage: number | null
          failed: number | null
          last_activity: string | null
          no_data: number | null
          pending: number | null
          processing: number | null
          total_api_calls_made: number | null
          total_skus: number | null
        }
        Relationships: []
      }
      sync_activity_status: {
        Row: {
          avg_api_calls: number | null
          count: number | null
          newest_attempt: string | null
          oldest_attempt: string | null
          status: string | null
        }
        Relationships: []
      }
      user_cart_summary: {
        Row: {
          cart_total: number | null
          item_count: number | null
          total_quantity: number | null
          total_savings: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_stuck_processing: {
        Args: Record<PropertyKey, never>
        Returns: {
          cleaned_count: number
        }[]
      }
      populate_sku_tracking: {
        Args: Record<PropertyKey, never>
        Returns: {
          inserted_count: number
        }[]
      }
      reset_failed_skus: {
        Args: Record<PropertyKey, never>
        Returns: {
          reset_count: number
        }[]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
