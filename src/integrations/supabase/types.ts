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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      exercises: {
        Row: {
          common_mistakes: string
          created_at: string
          difficulty: string
          equipment: string
          id: string
          instructions: string
          location: string
          muscle_group: string
          name: string
          reps: string
          rest_seconds: number
          sets: number
        }
        Insert: {
          common_mistakes?: string
          created_at?: string
          difficulty: string
          equipment: string
          id?: string
          instructions?: string
          location?: string
          muscle_group: string
          name: string
          reps?: string
          rest_seconds?: number
          sets?: number
        }
        Update: {
          common_mistakes?: string
          created_at?: string
          difficulty?: string
          equipment?: string
          id?: string
          instructions?: string
          location?: string
          muscle_group?: string
          name?: string
          reps?: string
          rest_seconds?: number
          sets?: number
        }
        Relationships: []
      }
      food_logs: {
        Row: {
          calories: number
          carbs: number
          created_at: string
          fat: number
          food_id: string | null
          food_name: string
          id: string
          log_date: string
          meal_slot: string
          protein: number
          servings: number
          user_id: string
        }
        Insert: {
          calories?: number
          carbs?: number
          created_at?: string
          fat?: number
          food_id?: string | null
          food_name: string
          id?: string
          log_date?: string
          meal_slot?: string
          protein?: number
          servings?: number
          user_id: string
        }
        Update: {
          calories?: number
          carbs?: number
          created_at?: string
          fat?: number
          food_id?: string | null
          food_name?: string
          id?: string
          log_date?: string
          meal_slot?: string
          protein?: number
          servings?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_logs_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      foods: {
        Row: {
          calories: number
          carbs: number
          created_at: string
          fat: number
          id: string
          is_veg: boolean
          is_vegan: boolean
          meal_slot: string | null
          name: string
          protein: number
          serving: string
        }
        Insert: {
          calories: number
          carbs?: number
          created_at?: string
          fat?: number
          id?: string
          is_veg?: boolean
          is_vegan?: boolean
          meal_slot?: string | null
          name: string
          protein?: number
          serving: string
        }
        Update: {
          calories?: number
          carbs?: number
          created_at?: string
          fat?: number
          id?: string
          is_veg?: boolean
          is_vegan?: boolean
          meal_slot?: string | null
          name?: string
          protein?: number
          serving?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          allergies: string | null
          created_at: string
          days_per_week: number | null
          fitness_level: string | null
          food_preference: string | null
          full_name: string
          gender: string | null
          goal: string | null
          height_cm: number | null
          id: string
          location: string | null
          onboarded: boolean
          session_minutes: number | null
          target_weight_kg: number | null
          updated_at: string
          water_goal_ml: number
          weight_kg: number | null
        }
        Insert: {
          age?: number | null
          allergies?: string | null
          created_at?: string
          days_per_week?: number | null
          fitness_level?: string | null
          food_preference?: string | null
          full_name?: string
          gender?: string | null
          goal?: string | null
          height_cm?: number | null
          id: string
          location?: string | null
          onboarded?: boolean
          session_minutes?: number | null
          target_weight_kg?: number | null
          updated_at?: string
          water_goal_ml?: number
          weight_kg?: number | null
        }
        Update: {
          age?: number | null
          allergies?: string | null
          created_at?: string
          days_per_week?: number | null
          fitness_level?: string | null
          food_preference?: string | null
          full_name?: string
          gender?: string | null
          goal?: string | null
          height_cm?: number | null
          id?: string
          location?: string | null
          onboarded?: boolean
          session_minutes?: number | null
          target_weight_kg?: number | null
          updated_at?: string
          water_goal_ml?: number
          weight_kg?: number | null
        }
        Relationships: []
      }
      progress_logs: {
        Row: {
          arms_cm: number | null
          chest_cm: number | null
          created_at: string
          id: string
          log_date: string
          thighs_cm: number | null
          user_id: string
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          arms_cm?: number | null
          chest_cm?: number | null
          created_at?: string
          id?: string
          log_date?: string
          thighs_cm?: number | null
          user_id: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          arms_cm?: number | null
          chest_cm?: number | null
          created_at?: string
          id?: string
          log_date?: string
          thighs_cm?: number | null
          user_id?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      water_logs: {
        Row: {
          amount_ml: number
          created_at: string
          id: string
          log_date: string
          user_id: string
        }
        Insert: {
          amount_ml: number
          created_at?: string
          id?: string
          log_date?: string
          user_id: string
        }
        Update: {
          amount_ml?: number
          created_at?: string
          id?: string
          log_date?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_log_exercises: {
        Row: {
          completed: boolean
          created_at: string
          exercise_id: string | null
          exercise_name: string
          id: string
          reps: number | null
          sets: number | null
          user_id: string
          weight_kg: number | null
          workout_log_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          exercise_id?: string | null
          exercise_name: string
          id?: string
          reps?: number | null
          sets?: number | null
          user_id: string
          weight_kg?: number | null
          workout_log_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          exercise_id?: string | null
          exercise_name?: string
          id?: string
          reps?: number | null
          sets?: number | null
          user_id?: string
          weight_kg?: number | null
          workout_log_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_log_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_log_exercises_workout_log_id_fkey"
            columns: ["workout_log_id"]
            isOneToOne: false
            referencedRelation: "workout_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          completed: boolean
          created_at: string
          duration_minutes: number | null
          focus: string
          id: string
          log_date: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          duration_minutes?: number | null
          focus?: string
          id?: string
          log_date?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          duration_minutes?: number | null
          focus?: string
          id?: string
          log_date?: string
          user_id?: string
        }
        Relationships: []
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
