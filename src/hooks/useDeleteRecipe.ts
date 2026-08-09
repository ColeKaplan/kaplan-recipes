import { useMutation, useQueryClient } from "react-query";
import { api } from "../lib/api";

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
            await api.recipes.delete(recipeId);
            return { success: true };
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["recipes"]);
                queryClient.invalidateQueries(["popularFood"]);
            },
        }
    );
};

export default useDeleteRecipe;
