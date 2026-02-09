import { useMutation, useQueryClient } from "react-query";
import { supabase } from "../lib/supabase";

interface DeleteCommentParams {
    commentId: string;
    recipeId: string;
}

const useDeleteComment = () => {
    const queryClient = useQueryClient();

    const deleteComment = async ({ commentId, recipeId }: DeleteCommentParams): Promise<void> => {
        // Delete the comment and all its replies (cascade should handle this if set up in DB)
        // But we'll be explicit and delete replies first
        const { error: repliesError } = await supabase
            .from("recipe_comments")
            .delete()
            .eq("parent_comment_id", commentId);

        if (repliesError) {
            throw repliesError;
        }

        // Delete the comment itself
        const { error } = await supabase
            .from("recipe_comments")
            .delete()
            .eq("id", commentId);

        if (error) {
            throw error;
        }
    };

    return useMutation(deleteComment, {
        onSuccess: (_, variables) => {
            // Invalidate and refetch comments for this recipe
            queryClient.invalidateQueries(["recipe-comments", variables.recipeId]);
        },
    });
};

export default useDeleteComment;
