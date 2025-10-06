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
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          record_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          record_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          record_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_url: string | null
          course_id: string
          course_title: string
          created_at: string
          external_course_id: string | null
          id: string
          issued_at: string
          proof_url: string | null
          score: number
          student_name: string
          unique_code: string
          updated_at: string
          user_id: string
          verification_notes: string | null
          verified: boolean
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          certificate_url?: string | null
          course_id: string
          course_title: string
          created_at?: string
          external_course_id?: string | null
          id?: string
          issued_at?: string
          proof_url?: string | null
          score: number
          student_name: string
          unique_code?: string
          updated_at?: string
          user_id: string
          verification_notes?: string | null
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          certificate_url?: string | null
          course_id?: string
          course_title?: string
          created_at?: string
          external_course_id?: string | null
          id?: string
          issued_at?: string
          proof_url?: string | null
          score?: number
          student_name?: string
          unique_code?: string
          updated_at?: string
          user_id?: string
          verification_notes?: string | null
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_external_course_id_fkey"
            columns: ["external_course_id"]
            isOneToOne: false
            referencedRelation: "external_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          post_type: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          post_type?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          post_type?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          certificate_id: string | null
          completed_at: string | null
          course_id: string | null
          created_at: string | null
          id: string
          score: number | null
          user_id: string | null
        }
        Insert: {
          certificate_id?: string | null
          completed_at?: string | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          score?: number | null
          user_id?: string | null
        }
        Update: {
          certificate_id?: string | null
          completed_at?: string | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          score?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_purchases: {
        Row: {
          amount: number | null
          course_id: string | null
          created_at: string | null
          currency: string | null
          external_course_id: string | null
          gateway: string | null
          gateway_payload: Json | null
          id: string
          status: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          course_id?: string | null
          created_at?: string | null
          currency?: string | null
          external_course_id?: string | null
          gateway?: string | null
          gateway_payload?: Json | null
          id?: string
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          course_id?: string | null
          created_at?: string | null
          currency?: string | null
          external_course_id?: string | null
          gateway?: string | null
          gateway_payload?: Json | null
          id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_purchases_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_purchases_external_course_id_fkey"
            columns: ["external_course_id"]
            isOneToOne: false
            referencedRelation: "external_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_resources: {
        Row: {
          course_id: string | null
          created_at: string | null
          external_course_id: string | null
          id: string
          label: string
          resource_type: string
          storage_path: string | null
          url: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          external_course_id?: string | null
          id?: string
          label: string
          resource_type: string
          storage_path?: string | null
          url?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          external_course_id?: string | null
          id?: string
          label?: string
          resource_type?: string
          storage_path?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_resources_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_resources_external_course_id_fkey"
            columns: ["external_course_id"]
            isOneToOne: false
            referencedRelation: "external_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          content: string | null
          created_at: string | null
          description: string | null
          duration_hours: number | null
          id: string
          instructor_name: string | null
          is_premium: boolean | null
          is_published: boolean | null
          pass_score: number | null
          price: number | null
          slug: string | null
          thumbnail_url: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          instructor_name?: string | null
          is_premium?: boolean | null
          is_published?: boolean | null
          pass_score?: number | null
          price?: number | null
          slug?: string | null
          thumbnail_url?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          instructor_name?: string | null
          is_premium?: boolean | null
          is_published?: boolean | null
          pass_score?: number | null
          price?: number | null
          slug?: string | null
          thumbnail_url?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      external_courses: {
        Row: {
          affiliate_tag: string | null
          created_at: string | null
          description: string | null
          id: string
          instructor_name: string | null
          is_published: boolean | null
          notes: string | null
          price_text: string | null
          provider_course_id: string | null
          source: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          affiliate_tag?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          instructor_name?: string | null
          is_published?: boolean | null
          notes?: string | null
          price_text?: string | null
          provider_course_id?: string | null
          source?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          affiliate_tag?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          instructor_name?: string | null
          is_published?: boolean | null
          notes?: string | null
          price_text?: string | null
          provider_course_id?: string | null
          source?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          id: string
          message: string
          rating: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          rating: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          rating?: number
          user_id?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      forum_posts: {
        Row: {
          content: string
          created_at: string | null
          forum_id: string | null
          id: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          forum_id?: string | null
          id?: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          forum_id?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_forum_id_fkey"
            columns: ["forum_id"]
            isOneToOne: false
            referencedRelation: "forums"
            referencedColumns: ["id"]
          },
        ]
      }
      forums: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      health_plans: {
        Row: {
          ai_generated: boolean | null
          content: Json
          created_at: string | null
          id: string
          plan_type: string
          user_id: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          content: Json
          created_at?: string | null
          id?: string
          plan_type: string
          user_id?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          content?: Json
          created_at?: string | null
          id?: string
          plan_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      health_records: {
        Row: {
          created_at: string
          diagnosis: string | null
          id: string
          nutrition_plan: Json | null
          subscription_valid_until: string | null
          symptoms: string | null
          treatment_plan: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          diagnosis?: string | null
          id?: string
          nutrition_plan?: Json | null
          subscription_valid_until?: string | null
          symptoms?: string | null
          treatment_plan?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          diagnosis?: string | null
          id?: string
          nutrition_plan?: Json | null
          subscription_valid_until?: string | null
          symptoms?: string | null
          treatment_plan?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          lesson_id: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string
          course_id: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          order_index: number
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          content: string
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          order_index: number
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          content?: string
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          order_index?: number
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          method: string | null
          status: Database["public"]["Enums"]["payment_status"]
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          method?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          method?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          allergies: string | null
          blood_type: string | null
          chronic_conditions: string | null
          created_at: string | null
          current_medications: string | null
          date_of_birth: string | null
          emergency_contact: string | null
          emergency_contact_phone: string | null
          first_name: string | null
          full_name: string | null
          gender: string | null
          height_cm: number | null
          id: string
          is_admin: boolean | null
          last_name: string | null
          location: string | null
          medical_history: string | null
          phone: string | null
          phone_number: string | null
          premium_until: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          subscription_status:
            | Database["public"]["Enums"]["subscription_type"]
            | null
          updated_at: string | null
          weight_kg: number | null
        }
        Insert: {
          allergies?: string | null
          blood_type?: string | null
          chronic_conditions?: string | null
          created_at?: string | null
          current_medications?: string | null
          date_of_birth?: string | null
          emergency_contact?: string | null
          emergency_contact_phone?: string | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id: string
          is_admin?: boolean | null
          last_name?: string | null
          location?: string | null
          medical_history?: string | null
          phone?: string | null
          phone_number?: string | null
          premium_until?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_type"]
            | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          allergies?: string | null
          blood_type?: string | null
          chronic_conditions?: string | null
          created_at?: string | null
          current_medications?: string | null
          date_of_birth?: string | null
          emergency_contact?: string | null
          emergency_contact_phone?: string | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          is_admin?: boolean | null
          last_name?: string | null
          location?: string | null
          medical_history?: string | null
          phone?: string | null
          phone_number?: string | null
          premium_until?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_type"]
            | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json | null
          created_at: string | null
          id: string
          lesson_id: string | null
          passed: boolean | null
          percentage: number | null
          quiz_id: string | null
          score: number
          total_questions: number
          user_id: string | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          passed?: boolean | null
          percentage?: number | null
          quiz_id?: string | null
          score: number
          total_questions: number
          user_id?: string | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          passed?: boolean | null
          percentage?: number | null
          quiz_id?: string | null
          score?: number
          total_questions?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string | null
          id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          order_index: number
          question: string
          quiz_id: string | null
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          id?: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          order_index: number
          question: string
          quiz_id?: string | null
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          id?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          order_index?: number
          question?: string
          quiz_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string | null
          id: string
          lesson_id: string | null
          pass_percentage: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          pass_percentage?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          pass_percentage?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          expires_at: string
          id: string
          payment_method: string | null
          started_at: string | null
          status: string | null
          subscription_type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          expires_at: string
          id?: string
          payment_method?: string | null
          started_at?: string | null
          status?: string | null
          subscription_type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          expires_at?: string
          id?: string
          payment_method?: string | null
          started_at?: string | null
          status?: string | null
          subscription_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          notes: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          notes?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          notes?: string | null
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
      grant_role_by_email: {
        Args: {
          _email: string
          _notes?: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_or_higher: {
        Args: { _user_id?: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: { _user_id?: string }
        Returns: boolean
      }
      log_admin_access: {
        Args: {
          _action: string
          _details?: Json
          _record_id: string
          _table_name: string
        }
        Returns: undefined
      }
      revoke_role_by_id: {
        Args: { _role_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "moderator" | "user"
      payment_status: "pending" | "success" | "failed" | "refunded"
      subscription_type: "free" | "premium" | "health_only"
      user_role: "student" | "admin" | "demo"
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
      app_role: ["super_admin", "admin", "moderator", "user"],
      payment_status: ["pending", "success", "failed", "refunded"],
      subscription_type: ["free", "premium", "health_only"],
      user_role: ["student", "admin", "demo"],
    },
  },
} as const
