// Database types for Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      recipes: {
        Row: {
          id: string
          user_id: string | null
          title: string
          summary: string | null
          ready_in_minutes: number
          servings: number
          image_url: string | null
          meal_type: string | null
          created_at: string
          updated_at: string
          aggregate_rating: number | null
          rating_count: number | null
          images: string[] | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          summary?: string | null
          ready_in_minutes?: number
          servings?: number
          image_url?: string | null
          meal_type?: string | null
          created_at?: string
          updated_at?: string
          aggregate_rating?: number | null
          rating_count?: number | null
          images?: string[] | null
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          summary?: string | null
          ready_in_minutes?: number
          servings?: number
          image_url?: string | null
          meal_type?: string | null
          created_at?: string
          updated_at?: string
          aggregate_rating?: number | null
          rating_count?: number | null
          images?: string[] | null
        }
      }
      ingredients: {
        Row: {
          id: string
          recipe_id: string
          name: string
          amount: number | null
          unit: string | null
          original: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          name: string
          amount?: number | null
          unit?: string | null
          original: string
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          name?: string
          amount?: number | null
          unit?: string | null
          original?: string
          order_index?: number
          created_at?: string
        }
      }
      instructions: {
        Row: {
          id: string
          recipe_id: string
          step_number: number
          step_text: string
          instruction_group: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          step_number: number
          step_text: string
          instruction_group?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          step_number?: number
          step_text?: string
          instruction_group?: string | null
          created_at?: string
        }
      }
      recipe_comments: {
        Row: {
          id: string
          recipe_id: string
          parent_comment_id: string | null
          author_name: string | null
          comment_text: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          parent_comment_id?: string | null
          author_name?: string | null
          comment_text: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          parent_comment_id?: string | null
          author_name?: string | null
          comment_text?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
