import { useMutation, useQueryClient } from "react-query";
import { RecipeFormData } from "../types/recipe";
import { supabase } from "../lib/supabase";
import { Recipe } from "../types/recipe";
import { Database } from "../types/database";
import { cleanupRemovedImages } from "../utils/storageUtils";

type RecipeRow = Database["public"]["Tables"]["recipes"]["Row"];
type RecipeUpdate = Database["public"]["Tables"]["recipes"]["Update"];
type IngredientRow = Database["public"]["Tables"]["ingredients"]["Row"];
type IngredientInsert = Database["public"]["Tables"]["ingredients"]["Insert"];
type InstructionRow = Database["public"]["Tables"]["instructions"]["Row"];
type InstructionInsert = Database["public"]["Tables"]["instructions"]["Insert"];

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
            // Fetch the original recipe to get current images for cleanup
            const { data: originalRecipe } = await supabase
                .from("recipes")
                .select("images")
                .eq("id", recipeId)
                .single<RecipeRow>();

            const originalImages = originalRecipe?.images as string[] | null;

            // Use existing images from formData (which may have been modified by user deletions)
            const existingImages = formData.existingImages || [];

            // Upload new images if present
            let uploadedImageUrls: string[] = [];
            if (formData.imageFiles && formData.imageFiles.length > 0) {
                for (const file of formData.imageFiles) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Math.random()}.${fileExt}`;
                    const filePath = `${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('recipe-images')
                        .upload(filePath, file);

                    if (uploadError) {
                        console.error('Error uploading image:', uploadError);
                        continue;
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from('recipe-images')
                        .getPublicUrl(filePath);

                    uploadedImageUrls.push(publicUrl);
                }
            }

            // Combine existing images (after deletions) with new uploads
            const allImages = [...existingImages, ...uploadedImageUrls];
            const mainImageUrl = allImages.length > 0 ? allImages[0] : (formData.imageUrl || null);

            // Clean up removed images from storage
            await cleanupRemovedImages(originalImages, allImages);

            // Update recipe
            const recipeUpdate: RecipeUpdate = {
                title: formData.title,
                summary: formData.summary || null,
                ready_in_minutes: formData.readyInMinutes,
                servings: formData.servings,
                image_url: mainImageUrl,
                meal_type: formData.mealType || null,
                images: allImages.length > 0 ? allImages : null,
            };

            const { data: recipe, error: recipeError } = await (supabase
                .from("recipes") as any)
                .update(recipeUpdate)
                .eq("id", recipeId)
                .select()
                .single();

            const typedRecipe = recipe as RecipeRow | null;

            if (recipeError) {
                throw recipeError;
            }

            if (!typedRecipe) {
                throw new Error("Failed to update recipe");
            }

            // Delete existing ingredients and instructions
            await supabase.from("ingredients").delete().eq("recipe_id", recipeId);
            await supabase.from("instructions").delete().eq("recipe_id", recipeId);

            // Insert new ingredients
            if (formData.ingredients.length > 0) {
                const ingredientsToInsert: IngredientInsert[] = formData.ingredients.map(
                    (ing, index) => ({
                        recipe_id: recipeId,
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
                    throw ingredientsError;
                }
            }

            // Insert new instructions
            if (formData.instructions.length > 0) {
                const instructionsToInsert: InstructionInsert[] = formData.instructions.map((inst) => ({
                    recipe_id: recipeId,
                    step_number: inst.stepNumber,
                    step_text: inst.stepText,
                    instruction_group: inst.instructionGroup || null,
                }));

                const { error: instructionsError } = await supabase
                    .from("instructions")
                    .insert(instructionsToInsert as any);

                if (instructionsError) {
                    throw instructionsError;
                }
            }

            // Fetch the complete recipe to return
            const { data: ingredients } = await supabase
                .from("ingredients")
                .select("*")
                .eq("recipe_id", recipeId)
                .order("order_index", { ascending: true });

            const { data: instructions } = await supabase
                .from("instructions")
                .select("*")
                .eq("recipe_id", recipeId)
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
                id: typedRecipe.id,
                title: typedRecipe.title,
                image: typedRecipe.image_url,
                readyInMinutes: typedRecipe.ready_in_minutes,
                servings: typedRecipe.servings,
                summary: typedRecipe.summary || undefined,
                extendedIngredients: typedIngredients.map((ing) => ({
                    id: ing.id,
                    original: ing.original,
                    name: ing.name,
                    amount: ing.amount,
                    unit: ing.unit,
                    order_index: ing.order_index,
                })),
                analyzedInstructions,
                mealType: typedRecipe.meal_type || undefined,
                userId: typedRecipe.user_id || undefined,
                createdAt: typedRecipe.created_at,
                updatedAt: typedRecipe.updated_at,
                images: typedRecipe.images as string[] || null,
            };

            return {
                recipe: completeRecipe,
                success: true,
            };
        },
        {
            onSuccess: (_, variables) => {
                // Invalidate queries to refetch data
                queryClient.invalidateQueries(["recipes"]);
                queryClient.invalidateQueries(["recipe", variables.recipeId]);
                queryClient.invalidateQueries(["popularFood"]);
            },
        }
    );
};

export default useUpdateRecipe;
