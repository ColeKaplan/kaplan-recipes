import { useQuery } from "react-query";
import { Recipe } from "../types/recipe";
import { supabase } from "../lib/supabase";
import { Database } from "../types/database";

type RecipeRow = Database["public"]["Tables"]["recipes"]["Row"];
type IngredientRow = Database["public"]["Tables"]["ingredients"]["Row"];
type InstructionRow = Database["public"]["Tables"]["instructions"]["Row"];

const useFetchRecipe = (recipeId: string | undefined) => {
  const fetchRecipe = async (): Promise<Recipe> => {
    if (!recipeId) {
      throw new Error("Recipe ID is required");
    }

    // Fetch recipe
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", recipeId)
      .single<RecipeRow>();

    if (recipeError) {
      throw recipeError;
    }

    if (!recipe) {
      throw new Error("Recipe not found");
    }

    // Fetch ingredients
    const { data: ingredients, error: ingredientsError } = await supabase
      .from("ingredients")
      .select("*")
      .eq("recipe_id", recipeId)
      .order("order_index", { ascending: true });

    if (ingredientsError) {
      throw ingredientsError;
    }

    // Fetch instructions
    const { data: instructions, error: instructionsError } = await supabase
      .from("instructions")
      .select("*")
      .eq("recipe_id", recipeId)
      .order("step_number", { ascending: true });

    if (instructionsError) {
      throw instructionsError;
    }

    // Group instructions by instruction_group
    const typedInstructions = (instructions || []) as InstructionRow[];
    const typedIngredients = (ingredients || []) as IngredientRow[];
    const groupedInstructions = typedInstructions.reduce((acc, instruction) => {
      const groupName = instruction.instruction_group || "Instructions";
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push({
        number: instruction.step_number,
        step: instruction.step_text,
        instruction_group: instruction.instruction_group || undefined,
      });
      return acc;
    }, {} as Record<string, Array<{ number: number; step: string; instruction_group?: string }>>);

    // Transform to AnalyzedInstruction format
    const analyzedInstructions = Object.entries(groupedInstructions).map(
      ([name, steps]) => ({
        name,
        steps: steps.map((step) => ({
          number: step.number,
          step: step.step,
          instruction_group: step.instruction_group,
        })),
      })
    );

    // Transform to Recipe format
    return {
      id: recipe.id,
      title: recipe.title,
      image: recipe.image_url,
      readyInMinutes: recipe.ready_in_minutes,
      servings: recipe.servings,
      summary: recipe.summary || undefined,
      extendedIngredients: typedIngredients.map((ing) => ({
        id: ing.id,
        original: ing.original,
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        order_index: ing.order_index,
      })),
      analyzedInstructions,
      mealType: recipe.meal_type || undefined,
      userId: recipe.user_id || undefined,
      createdAt: recipe.created_at,
      updatedAt: recipe.updated_at,
    };
  };

  return useQuery<Recipe, Error>(
    ["recipe", recipeId],
    fetchRecipe,
    {
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minute
      cacheTime: 3600000, // 1 hour
      enabled: !!recipeId,
    }
  );
};

export default useFetchRecipe;
