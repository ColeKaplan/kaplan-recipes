// Type definitions for Supabase recipe data

export interface ExtendedIngredient {
  id: string;
  original: string;
  name: string;
  amount: number | null;
  unit: string | null;
  order_index: number;
}

export interface Step {
  number: number;
  step: string;
  instruction_group?: string | null;
}

export interface AnalyzedInstruction {
  name: string;
  steps: Step[];
}

export interface Recipe {
  id: string;
  title: string;
  image?: string | null;
  readyInMinutes: number;
  servings: number;
  summary?: string | null;
  extendedIngredients: ExtendedIngredient[];
  analyzedInstructions: AnalyzedInstruction[];
  instructions?: string;
  mealType?: string | null;
  userId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  aggregateRating?: number;
  ratingCount?: number;
  images?: string[] | null;
}

export interface RecipeListItem {
  id: string;
  title: string;
  image?: string | null;
  readyInMinutes: number;
  servings: number;
  mealType?: string | null;
  aggregateRating?: number;
  ratingCount?: number;
}

// Form types for recipe creation
export interface RecipeFormData {
  title: string;
  summary?: string;
  readyInMinutes: number;
  servings: number;
  imageUrl?: string;
  imageFiles?: File[];
  existingImages?: string[]; // For edit mode - images to keep
  mealType?: string;
  ingredients: {
    original: string;
    name: string;
    amount: number | null;
    unit: string | null;
  }[];
  instructions: {
    stepNumber: number;
    stepText: string;
    instructionGroup?: string;
  }[];
}
