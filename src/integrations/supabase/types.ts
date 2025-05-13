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
      location_vehicles: {
        Row: {
          created_at: string
          id: string
          location_id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_id: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_vehicles_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_vehicles_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string
          city: string
          created_at: string
          created_by: string
          id: string
          is_default: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          notes: string | null
          organization_id: string | null
          state: string
          updated_at: string
          zip_code: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          created_by: string
          id?: string
          is_default?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          notes?: string | null
          organization_id?: string | null
          state: string
          updated_at?: string
          zip_code: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          created_by?: string
          id?: string
          is_default?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          notes?: string | null
          organization_id?: string | null
          state?: string
          updated_at?: string
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_organization_id_fkey"
            columns: ["organization_id"]
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
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          organization_id: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          organization_id?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          organization_id?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_wash_statuses: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          notes: string | null
          post_wash_photo: string | null
          technician_id: string | null
          updated_at: string
          vehicle_id: string
          wash_request_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          notes?: string | null
          post_wash_photo?: string | null
          technician_id?: string | null
          updated_at?: string
          vehicle_id: string
          wash_request_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          notes?: string | null
          post_wash_photo?: string | null
          technician_id?: string | null
          updated_at?: string
          vehicle_id?: string
          wash_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_wash_statuses_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_wash_statuses_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_wash_statuses_wash_request_id_fkey"
            columns: ["wash_request_id"]
            isOneToOne: false
            referencedRelation: "organization_wash_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_wash_statuses_wash_request_id_fkey"
            columns: ["wash_request_id"]
            isOneToOne: false
            referencedRelation: "wash_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          color: string | null
          created_at: string
          id: string
          image_url: string | null
          license_plate: string | null
          make: string
          model: string
          organization_id: string | null
          type: string | null
          updated_at: string
          user_id: string
          vin_number: string | null
          year: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          license_plate?: string | null
          make: string
          model: string
          organization_id?: string | null
          type?: string | null
          updated_at?: string
          user_id: string
          vin_number?: string | null
          year: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          license_plate?: string | null
          make?: string
          model?: string
          organization_id?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string
          vin_number?: string | null
          year?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      wash_locations: {
        Row: {
          address: string
          city: string
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          state: string
          updated_at: string
          zip_code: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          state: string
          updated_at?: string
          zip_code: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          state?: string
          updated_at?: string
          zip_code?: string
        }
        Relationships: []
      }
      wash_request_vehicles: {
        Row: {
          created_at: string
          id: string
          vehicle_id: string
          wash_request_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          vehicle_id: string
          wash_request_id: string
        }
        Update: {
          created_at?: string
          id?: string
          vehicle_id?: string
          wash_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wash_request_vehicles_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wash_request_vehicles_wash_request_id_fkey"
            columns: ["wash_request_id"]
            isOneToOne: false
            referencedRelation: "organization_wash_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wash_request_vehicles_wash_request_id_fkey"
            columns: ["wash_request_id"]
            isOneToOne: false
            referencedRelation: "wash_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      wash_requests: {
        Row: {
          created_at: string
          id: string
          location_detail_id: string | null
          location_id: string | null
          notes: string | null
          organization_id: string | null
          preferred_date_end: string | null
          preferred_date_start: string
          price: number
          recurring_count: number | null
          recurring_frequency: string | null
          status: string
          technician_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_detail_id?: string | null
          location_id?: string | null
          notes?: string | null
          organization_id?: string | null
          preferred_date_end?: string | null
          preferred_date_start: string
          price: number
          recurring_count?: number | null
          recurring_frequency?: string | null
          status?: string
          technician_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location_detail_id?: string | null
          location_id?: string | null
          notes?: string | null
          organization_id?: string | null
          preferred_date_end?: string | null
          preferred_date_start?: string
          price?: number
          recurring_count?: number | null
          recurring_frequency?: string | null
          status?: string
          technician_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wash_requests_location_detail_id_fkey"
            columns: ["location_detail_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wash_requests_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wash_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      organization_wash_requests: {
        Row: {
          created_at: string | null
          id: string | null
          location_id: string | null
          notes: string | null
          organization_id: string | null
          preferred_date_end: string | null
          preferred_date_start: string | null
          price: number | null
          status: string | null
          technician_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wash_requests_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wash_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      is_technician: {
        Args: Record<PropertyKey, never>
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
