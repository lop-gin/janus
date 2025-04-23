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
      activity_log: {
        Row: {
          activity_type: string
          company_id: number
          created_at: string
          description: string
          entity_id: number
          entity_type: string
          id: number
          user_id: number
        }
        Insert: {
          activity_type: string
          company_id: number
          created_at?: string
          description: string
          entity_id: number
          entity_type: string
          id?: number
          user_id: number
        }
        Update: {
          activity_type?: string
          company_id?: number
          created_at?: string
          description?: string
          entity_id?: number
          entity_type?: string
          id?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          company_id: number
          created_at: string
          created_by: number
          description: string | null
          id: number
          name: string
          updated_at: string
          updated_by: number
        }
        Insert: {
          company_id: number
          created_at?: string
          created_by: number
          description?: string | null
          id?: number
          name: string
          updated_at?: string
          updated_by: number
        }
        Update: {
          company_id?: number
          created_at?: string
          created_by?: number
          description?: string | null
          id?: number
          name?: string
          updated_at?: string
          updated_by?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          company_type: string | null
          created_at: string
          email: string | null
          id: number
          logo_url: string | null
          name: string
          phone: string | null
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_type?: string | null
          created_at?: string
          email?: string | null
          id?: number
          logo_url?: string | null
          name: string
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_type?: string | null
          created_at?: string
          email?: string | null
          id?: number
          logo_url?: string | null
          name?: string
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          billing_address: string | null
          company: string | null
          company_id: number
          created_at: string
          created_by: number
          email: string | null
          id: number
          initial_balance: number | null
          name: string
          updated_at: string
          updated_by: number
        }
        Insert: {
          billing_address?: string | null
          company?: string | null
          company_id: number
          created_at?: string
          created_by: number
          email?: string | null
          id?: number
          initial_balance?: number | null
          name: string
          updated_at?: string
          updated_by: number
        }
        Update: {
          billing_address?: string | null
          company?: string | null
          company_id?: number
          created_at?: string
          created_by?: number
          email?: string | null
          id?: number
          initial_balance?: number | null
          name?: string
          updated_at?: string
          updated_by?: number
        }
        Relationships: [
          {
            foreignKeyName: "customers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      payment_allocations: {
        Row: {
          amount: number
          created_at: string
          created_by: number
          id: number
          payment_id: number
          transaction_id: number
          updated_at: string
          updated_by: number
        }
        Insert: {
          amount: number
          created_at?: string
          created_by: number
          id?: number
          payment_id: number
          transaction_id: number
          updated_at?: string
          updated_by: number
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: number
          id?: number
          payment_id?: number
          transaction_id?: number
          updated_at?: string
          updated_by?: number
        }
        Relationships: [
          {
            foreignKeyName: "payment_allocations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_allocations_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_allocations_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_allocations_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_received: number
          company_id: number
          created_at: string
          created_by: number
          customer_id: number
          id: number
          message: string | null
          payment_date: string
          payment_number: string
          unallocated_amount: number | null
          updated_at: string
          updated_by: number
        }
        Insert: {
          amount_received: number
          company_id: number
          created_at?: string
          created_by: number
          customer_id: number
          id?: number
          message?: string | null
          payment_date: string
          payment_number: string
          unallocated_amount?: number | null
          updated_at?: string
          updated_by: number
        }
        Update: {
          amount_received?: number
          company_id?: number
          created_at?: string
          created_by?: number
          customer_id?: number
          id?: number
          message?: string | null
          payment_date?: string
          payment_number?: string
          unallocated_amount?: number | null
          updated_at?: string
          updated_by?: number
        }
        Relationships: [
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          as_of_date: string | null
          category_id: number | null
          company_id: number
          conversion_factor: number | null
          created_at: string
          created_by: number
          default_tax_percent: number | null
          description: string | null
          id: number
          initial_quantity: number | null
          name: string
          primary_unit_of_measure: string
          purchase_price: number | null
          reorder_point: number | null
          sale_price: number | null
          secondary_unit_of_measure: string | null
          sku: string | null
          updated_at: string
          updated_by: number
        }
        Insert: {
          as_of_date?: string | null
          category_id?: number | null
          company_id: number
          conversion_factor?: number | null
          created_at?: string
          created_by: number
          default_tax_percent?: number | null
          description?: string | null
          id?: number
          initial_quantity?: number | null
          name: string
          primary_unit_of_measure: string
          purchase_price?: number | null
          reorder_point?: number | null
          sale_price?: number | null
          secondary_unit_of_measure?: string | null
          sku?: string | null
          updated_at?: string
          updated_by: number
        }
        Update: {
          as_of_date?: string | null
          category_id?: number | null
          company_id?: number
          conversion_factor?: number | null
          created_at?: string
          created_by?: number
          default_tax_percent?: number | null
          description?: string | null
          id?: number
          initial_quantity?: number | null
          name?: string
          primary_unit_of_measure?: string
          purchase_price?: number | null
          reorder_point?: number | null
          sale_price?: number | null
          secondary_unit_of_measure?: string | null
          sku?: string | null
          updated_at?: string
          updated_by?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          company_id: number
          created_at: string
          created_by: number | null
          description: string | null
          id: number
          is_system_role: boolean | null
          permissions: Json | null
          role_name: string
          updated_at: string
          updated_by: number | null
        }
        Insert: {
          company_id: number
          created_at?: string
          created_by?: number | null
          description?: string | null
          id?: number
          is_system_role?: boolean | null
          permissions?: Json | null
          role_name: string
          updated_at?: string
          updated_by?: number | null
        }
        Update: {
          company_id?: number
          created_at?: string
          created_by?: number | null
          description?: string | null
          id?: number
          is_system_role?: boolean | null
          permissions?: Json | null
          role_name?: string
          updated_at?: string
          updated_by?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roles_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_items: {
        Row: {
          amount: number
          created_at: string
          created_by: number
          description: string | null
          id: number
          product_id: number | null
          quantity: number
          tax_percent: number
          transaction_id: number
          unit_of_measure: string
          unit_price: number
          updated_at: string
          updated_by: number
        }
        Insert: {
          amount: number
          created_at?: string
          created_by: number
          description?: string | null
          id?: number
          product_id?: number | null
          quantity: number
          tax_percent: number
          transaction_id: number
          unit_of_measure: string
          unit_price: number
          updated_at?: string
          updated_by: number
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: number
          description?: string | null
          id?: number
          product_id?: number | null
          quantity?: number
          tax_percent?: number
          transaction_id?: number
          unit_of_measure?: string
          unit_price?: number
          updated_at?: string
          updated_by?: number
        }
        Relationships: [
          {
            foreignKeyName: "transaction_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_items_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          company_id: number
          created_at: string
          created_by: number
          customer_id: number
          deleted_at: string | null
          due_date: string | null
          expiration_date: string | null
          gross_total: number
          id: number
          message: string | null
          net_total: number
          other_fees: number
          parent_transaction_id: number | null
          sales_rep_id: number | null
          status: Database["public"]["Enums"]["payment_status"] | null
          tax_total: number
          terms: string | null
          transaction_date: string
          transaction_number: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          updated_by: number
        }
        Insert: {
          company_id: number
          created_at?: string
          created_by: number
          customer_id: number
          deleted_at?: string | null
          due_date?: string | null
          expiration_date?: string | null
          gross_total?: number
          id?: number
          message?: string | null
          net_total?: number
          other_fees?: number
          parent_transaction_id?: number | null
          sales_rep_id?: number | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          tax_total?: number
          terms?: string | null
          transaction_date: string
          transaction_number: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          updated_by: number
        }
        Update: {
          company_id?: number
          created_at?: string
          created_by?: number
          customer_id?: number
          deleted_at?: string | null
          due_date?: string | null
          expiration_date?: string | null
          gross_total?: number
          id?: number
          message?: string | null
          net_total?: number
          other_fees?: number
          parent_transaction_id?: number | null
          sales_rep_id?: number | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          tax_total?: number
          terms?: string | null
          transaction_date?: string
          transaction_number?: string
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          updated_by?: number
        }
        Relationships: [
          {
            foreignKeyName: "transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_transaction_id_fkey"
            columns: ["parent_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_sales_rep_id_fkey"
            columns: ["sales_rep_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: number | null
          id: number
          role_id: number
          user_id: number
        }
        Insert: {
          created_at?: string
          created_by?: number | null
          id?: number
          role_id: number
          user_id: number
        }
        Update: {
          created_at?: string
          created_by?: number | null
          id?: number
          role_id?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_user_id: string | null
          avatar_url: string | null
          company_id: number
          created_at: string
          created_by: number | null
          email: string
          id: number
          is_active: boolean | null
          name: string
          password_hash: string
          phone: string | null
          updated_at: string
          updated_by: number | null
        }
        Insert: {
          auth_user_id?: string | null
          avatar_url?: string | null
          company_id: number
          created_at?: string
          created_by?: number | null
          email: string
          id?: number
          is_active?: boolean | null
          name: string
          password_hash: string
          phone?: string | null
          updated_at?: string
          updated_by?: number | null
        }
        Update: {
          auth_user_id?: string | null
          avatar_url?: string | null
          company_id?: number
          created_at?: string
          created_by?: number | null
          email?: string
          id?: number
          is_active?: boolean | null
          name?: string
          password_hash?: string
          phone?: string | null
          updated_at?: string
          updated_by?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      disable_rls_for_tables: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      enable_rls_for_tables: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      execute_sql: {
        Args: {
          sql_query: string
        }
        Returns: Json
      }
    }
    Enums: {
      payment_status:
        | "due"
        | "partially_paid"
        | "paid"
        | "overpaid"
        | "void"
        | "canceled"
      transaction_type:
        | "invoice"
        | "sales_receipt"
        | "credit_note"
        | "refund_receipt"
        | "estimate"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

