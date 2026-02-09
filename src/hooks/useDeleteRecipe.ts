import { useMutation, useQueryClient } from "react-query";
import { supabase } from "../lib/supabase";
import { Database } from "../types/database";
import { deleteImagesFromStorage } from "../utils/storageUtils";

type RecipeRow = Database["public"]["Tables"]["recipes"]["Row"];

interface DeleteRecipeParams {
    recipeId: string;
}

interface DeleteRecipeResponse {
    success: boolean;
}

const useDeleteRecipe = () => {
    const queryClient = useQueryClient();

    return useMutation<DeleteRecipeResponse, Error, DeleteRecipeParams>(
        async ({ recipeId }: DeleteRecipeParams) => {
            // First, fetch the recipe to get image URLs for cleanup
            const { data: recipe, error: fetchError } = await supabase
                .from("recipes")
                .select("images, image_url")
                .eq("id", recipeId)
                .single<RecipeRow>();

            if (fetchError) {
                throw fetchError;
            }

            // Delete related data (ingredients, instructions, comments)
            // These should cascade if you have foreign key constraints, but we'll be explicit
            await supabase.from("ingredients").delete().eq("recipe_id", recipeId);
            await supabase.from("instructions").delete().eq("recipe_id", recipeId);
            await supabase.from("recipe_comments").delete().eq("recipe_id", recipeId);

            // Delete the recipe itself
            const { error: deleteError } = await supabase
                .from("recipes")
                .delete()
                .eq("id", recipeId);

            if (deleteError) {
                throw deleteError;
            }

            // Clean up images from storage
            const imagesToDelete: string[] = [];

            // Add all images from the images array
            if (recipe?.images && Array.isArray(recipe.images)) {
                imagesToDelete.push(...recipe.images);
            }

            // Add the main image_url if it exists and isn't already in the array
            if (recipe?.image_url && !imagesToDelete.includes(recipe.image_url)) {
                imagesToDelete.push(recipe.image_url);
            }

            // Delete all images from storage
            if (imagesToDelete.length > 0) {
                await deleteImagesFromStorage(imagesToDelete);
            }

            return {
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

export default useDeleteRecipe;
