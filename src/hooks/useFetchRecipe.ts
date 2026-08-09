import { useQuery } from "react-query";
import { Recipe } from "../types/recipe";
import { api } from "../lib/api";

const useFetchRecipe = (recipeId: string | undefined) => {
  return useQuery<Recipe, Error>(
    ["recipe", recipeId],
    async () => {
      if (!recipeId) throw new Error("Recipe ID is required");

      const { recipe, ingredients, instructions } = await api.recipes.getById(recipeId);
      if (!recipe) throw new Error("Recipe not found");

      // Group instructions by instruction_group
      const groupedInstructions = (instructions || []).reduce(
        (acc: Record<string, Array<{ number: number; step: string; instruction_group?: string }>>, instruction: any) => {
          const groupName = instruction.instruction_group || "Instructions";
          if (!acc[groupName]) acc[groupName] = [];
          acc[groupName].push({
            number: instruction.step_number,
            step: instruction.step_text,
            instruction_group: instruction.instruction_group || undefined,
          });
          return acc;
        },
        {}
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

      return {
        id: recipe.id,
        title: recipe.title,
        image: recipe.image_url,
        readyInMinutes: recipe.ready_in_minutes,
        servings: recipe.servings,
        summary: recipe.summary || undefined,
        extendedIngredients: (ingredients || []).map((ing: any) => ({
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
        aggregateRating: recipe.aggregate_rating || 0,
        ratingCount: recipe.rating_count || 0,
        images: recipe.images || null,
      };
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 60000,
      cacheTime: 3600000,
      enabled: !!recipeId,
    }
  );
};

export default useFetchRecipe;
