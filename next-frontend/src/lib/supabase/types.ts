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
      customers: {
        Row: {
          city: string | null
          company: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          state: string | null
          street: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          state?: string | null
          street?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          state?: string | null
          street?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      document_items: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          description: string | null
          document_id: string
          id: string
          product: string
          quantity: number | null
          service_date: string | null
          tax_percent: number | null
          unit: string | null
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          description?: string | null
          document_id: string
          id?: string
          product: string
          quantity?: number | null
          service_date?: string | null
          tax_percent?: number | null
          unit?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          description?: string | null
          document_id?: string
          id?: string
          product?: string
          quantity?: number | null
          service_date?: string | null
          tax_percent?: number | null
          unit?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_items_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          }
        ]
      }
      document_references: {
        Row: {
          amount: number
          created_at: string
          id: string
          reference_type: string
          referenced_document_id: string
          source_document_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          reference_type: string
          referenced_document_id: string
          source_document_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          reference_type?: string
          referenced_document_id?: string
          source_document_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_references_referenced_document_id_fkey"
            columns: ["referenced_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_references_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          }
        ]
      }
      documents: {
        Row: {
          balance_due: number | null
          created_at: string
          customer_id: string | null
          document_number: string
          document_type: string
          due_date: string | null
          id: string
          issue_date: string
          message_on_invoice: string | null
          message_on_statement: string | null
          sales_rep: string | null
          status: string | null
          tags: string[] | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          balance_due?: number | null
          created_at?: string
          customer_id?: string | null
          document_number: string
          document_type: string
          due_date?: string | null
          id?: string
          issue_date?: string
          message_on_invoice?: string | null
          message_on_statement?: string | null
          sales_rep?: string | null
          status?: string | null
          tags?: string[] | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          balance_due?: number | null
          created_at?: string
          customer_id?: string | null
          document_number?: string
          document_type?: string
          due_date?: string | null
          id?: string
          issue_date?: string
          message_on_invoice?: string | null
          message_on_statement?: string | null
          sales_rep?: string | null
          status?: string | null
          tags?: string[] | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          }
        ]
      }
      inventory_items: {
        Row: {
          category: string | null
          cost_price: number | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          selling_price: number | null
          sku: string | null
          type: string
          unit_of_measure: string | null
        }
        Insert: {
          category?: string | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          selling_price?: number | null
          sku?: string | null
          type: string
          unit_of_measure?: string | null
        }
        Update: {
          category?: string | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          selling_price?: number | null
          sku?: string | null
          type?: string
          unit_of_measure?: string | null
        }
        Relationships: []
      }
      modules: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      other_fees: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          document_id: string
          id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          document_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          document_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "other_fees_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          address: string | null
          company_name: string | null
          company_type: string | null
          created_at: string
          full_name: string | null
          id: string
          is_superadmin: boolean | null
          phone: string | null
          role_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          company_type?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_superadmin?: boolean | null
          phone?: string | null
          role_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_name?: string | null
          company_type?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_superadmin?: boolean | null
          phone?: string | null
          role_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          }
        ]
      }
      refund_receipts: {
        Row: {
          id: string
          refund_date: string | null
          refund_method: string | null
        }
        Insert: {
          id: string
          refund_date?: string | null
          refund_method?: string | null
        }
        Update: {
          id?: string
          refund_date?: string | null
          refund_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refund_receipts_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "documents"
            referencedColumns: ["id"]
          }
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          module_id: string
          permissions: string[] | null
          role_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          module_id: string
          permissions?: string[] | null
          role_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          module_id?: string
          permissions?: string[] | null
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          }
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      register_company_and_user: {
        Args: {
          p_auth_user_id: string
          p_email: string
          p_full_name: string
          p_company_name: string
          p_company_type: string
          p_phone: string
          p_address: string
        }
        Returns: Json
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