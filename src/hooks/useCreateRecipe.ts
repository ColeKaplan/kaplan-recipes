import { useMutation, useQueryClient } from "react-query";
import { RecipeFormData } from "../types/recipe";
import { Recipe } from "../types/recipe";
import { api } from "../lib/api";

import { compressImages } from "../utils/imageCompression";

interface CreateRecipeResponse {
  recipe: Recipe;
  success: boolean;
}

const useCreateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateRecipeResponse, Error, RecipeFormData>(
    async (formData: RecipeFormData) => {
      // Get current user from backend
      const token = localStorage.getItem("access_token") || undefined;
      const { user } = await api.auth.getUser(token);

      // Compress and upload images via backend
      let uploadedImageUrls: string[] = [];
      if (formData.imageFiles && formData.imageFiles.length > 0) {
        const compressedFiles = await compressImages(formData.imageFiles);
        const { urls } = await api.images.upload(compressedFiles);
        uploadedImageUrls = urls;
      }

      const mainImageUrl = uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : (formData.imageUrl || null);
      const allImages = uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined;

      // Create recipe on backend
      const { id: recipeId } = await api.recipes.create({
        recipeData: {
          title: formData.title,
          summary: formData.summary || null,
          ready_in_minutes: formData.readyInMinutes,
          servings: formData.servings,
          image_url: mainImageUrl,
          meal_type: formData.mealType || null,
          images: allImages,
        },
        ingredients: formData.ingredients.map((ing, index) => ({
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          original: ing.original,
          order_index: index,
        })),
        instructions: formData.instructions.map((inst) => ({
          step_number: inst.stepNumber,
          step_text: inst.stepText,
          instruction_group: inst.instructionGroup || null,
        })),
        userId: user?.id || null,
      });

      // Fetch the complete recipe to return
      const { recipe, ingredients, instructions } = await api.recipes.getById(recipeId);

      const groupedInstructions = (instructions || []).reduce(
        (acc: Record<string, Array<{ number: number; step: string; instruction_group?: string }>>, inst: any) => {
          const groupName = inst.instruction_group || "Instructions";
          if (!acc[groupName]) acc[groupName] = [];
          acc[groupName].push({ number: inst.step_number, step: inst.step_text, instruction_group: inst.instruction_group || undefined });
          return acc;
        },
        {}
      );

      const analyzedInstructions = Object.entries(groupedInstructions).map(([name, steps]) => ({
        name,
        steps: steps.map((s) => ({ number: s.number, step: s.step, instruction_group: s.instruction_group })),
      }));

      const completeRecipe: Recipe = {
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
      };

      return { recipe: completeRecipe, success: true };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["recipes"]);
        queryClient.invalidateQueries(["popularFood"]);
      },
    }
  );
};

export default useCreateRecipe;
