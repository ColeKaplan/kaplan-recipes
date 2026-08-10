import { useMutation, useQueryClient } from "react-query";
import { RecipeFormData } from "../types/recipe";
import { Recipe } from "../types/recipe";
import { api } from "../lib/api";
import { compressImages } from "../utils/imageCompression";

interface UpdateRecipeResponse {
    recipe: Recipe;
    success: boolean;
}

interface UpdateRecipeParams {
    recipeId: string;
    formData: RecipeFormData;
}

const useUpdateRecipe = () => {
    const queryClient = useQueryClient();

    return useMutation<UpdateRecipeResponse, Error, UpdateRecipeParams>(
        async ({ recipeId, formData }: UpdateRecipeParams) => {
            // Fetch original recipe images for cleanup comparison
            const { recipe: originalRecipe } = await api.recipes.getById(recipeId);
            const originalImages = originalRecipe?.images as string[] | null;

            const existingImages = formData.existingImages || [];

            // Compress and upload new images via backend
            let uploadedImageUrls: string[] = [];
            if (formData.imageFiles && formData.imageFiles.length > 0) {
                const compressedFiles = await compressImages(formData.imageFiles);
                const { urls } = await api.images.upload(compressedFiles);
                uploadedImageUrls = urls;
            }

            const allImages = [...existingImages, ...uploadedImageUrls];
            const mainImageUrl = allImages.length > 0 ? allImages[0] : (formData.imageUrl || null);

            // Clean up removed images via backend
            if (originalImages && originalImages.length > 0) {
                const newSet = new Set(allImages);
                const removed = originalImages.filter((url) => !newSet.has(url));
                if (removed.length > 0) {
                    await api.images.delete(removed);
                }
            }

            // Update recipe via backend
            const { id } = await api.recipes.update(recipeId, {
                recipeData: {
                    title: formData.title,
                    summary: formData.summary || null,
                    ready_in_minutes: formData.readyInMinutes,
                    servings: formData.servings,
                    image_url: mainImageUrl,
                    meal_type: formData.mealType || null,
                    images: allImages.length > 0 ? allImages : null,
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
            });

            // Fetch and return the complete updated recipe
            const { recipe, ingredients, instructions } = await api.recipes.getById(id);

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
                images: recipe.images as string[] || null,
            };

            return { recipe: completeRecipe, success: true };
        },
        {
            retry: false,
            onSuccess: (_, variables) => {
                queryClient.invalidateQueries(["recipes"]);
                queryClient.invalidateQueries(["recipe", variables.recipeId]);
                queryClient.invalidateQueries(["popularFood"]);
            },
        }
    );
};

export default useUpdateRecipe;
