import { useMutation, useQueryClient } from "react-query";
import { RecipeFormData } from "../types/recipe";
import { supabase } from "../lib/supabase";
import { Recipe } from "../types/recipe";
import { Database } from "../types/database";

type RecipeRow = Database["public"]["Tables"]["recipes"]["Row"];
type RecipeInsert = Database["public"]["Tables"]["recipes"]["Insert"];
type IngredientRow = Database["public"]["Tables"]["ingredients"]["Row"];
type IngredientInsert = Database["public"]["Tables"]["ingredients"]["Insert"];
type InstructionRow = Database["public"]["Tables"]["instructions"]["Row"];
type InstructionInsert = Database["public"]["Tables"]["instructions"]["Insert"];

interface CreateRecipeResponse {
  recipe: Recipe;
  success: boolean;
}

const useCreateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateRecipeResponse, Error, RecipeFormData>(
    async (formData: RecipeFormData) => {
      // Get current user (if using auth)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Insert recipe
      const recipeInsert: RecipeInsert = {
        title: formData.title,
        summary: formData.summary || null,
        ready_in_minutes: formData.readyInMinutes,
        servings: formData.servings,
        image_url: formData.imageUrl || null,
        meal_type: formData.mealType || null,
        user_id: user?.id || null,
      };

      const { data: recipe, error: recipeError } = await supabase
        .from("recipes")
        .insert(recipeInsert as any)
        .select()
        .single<RecipeRow>();

      if (recipeError) {
        throw recipeError;
      }

      if (!recipe) {
        throw new Error("Failed to create recipe");
      }

      // Insert ingredients
      if (formData.ingredients.length > 0) {
        const ingredientsToInsert: IngredientInsert[] = formData.ingredients.map(
          (ing, index) => ({
            recipe_id: recipe.id,
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            original: ing.original,
            order_index: index,
          })
        );

        const { error: ingredientsError } = await supabase
          .from("ingredients")
          .insert(ingredientsToInsert as any);

        if (ingredientsError) {
          // Rollback recipe if ingredients fail
          await supabase.from("recipes").delete().eq("id", recipe.id);
          throw ingredientsError;
        }
      }

      // Insert instructions
      if (formData.instructions.length > 0) {
        const instructionsToInsert: InstructionInsert[] = formData.instructions.map((inst) => ({
          recipe_id: recipe.id,
          step_number: inst.stepNumber,
          step_text: inst.stepText,
          instruction_group: inst.instructionGroup || null,
        }));

        const { error: instructionsError } = await supabase
          .from("instructions")
          .insert(instructionsToInsert as any);

        if (instructionsError) {
          // Rollback recipe and ingredients if instructions fail
          await supabase.from("ingredients").delete().eq("recipe_id", recipe.id);
          await supabase.from("recipes").delete().eq("id", recipe.id);
          throw instructionsError;
        }
      }

      // Fetch the complete recipe to return
      const { data: ingredients } = await supabase
        .from("ingredients")
        .select("*")
        .eq("recipe_id", recipe.id)
        .order("order_index", { ascending: true });

      const { data: instructions } = await supabase
        .from("instructions")
        .select("*")
        .eq("recipe_id", recipe.id)
        .order("step_number", { ascending: true });

      // Group instructions
      const typedInstructions = (instructions || []) as InstructionRow[];
      const typedIngredients = (ingredients || []) as IngredientRow[];
      const groupedInstructions = typedInstructions.reduce(
        (acc, instruction) => {
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
        },
        {} as Record<
          string,
          Array<{ number: number; step: string; instruction_group?: string }>
        >
      );

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

      const completeRecipe: Recipe = {
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

      return {
        recipe: completeRecipe,
        success: true,
      };
    },
    {
      onSuccess: () => {
        // Invalidate queries to refetch data
        queryClient.invalidateQueries(["recipes"]);
        queryClient.invalidateQueries(["popularFood"]);
      },
    }
  );
};

export default useCreateRecipe;
