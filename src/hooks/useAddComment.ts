import { useMutation, useQueryClient } from "react-query";
import { supabase } from "../lib/supabase";
import { Database } from "../types/database";

type CommentInsert = Database["public"]["Tables"]["recipe_comments"]["Insert"];

interface AddCommentParams {
    recipe_id: string;
    comment_text: string;
    author_name?: string | null;
    parent_comment_id?: string | null;
}

const useAddComment = () => {
    const queryClient = useQueryClient();

    const addComment = async (params: AddCommentParams): Promise<void> => {
        const commentData: CommentInsert = {
            recipe_id: params.recipe_id,
            comment_text: params.comment_text,
            author_name: params.author_name || null,
            parent_comment_id: params.parent_comment_id || null,
        };

        const { error } = await (supabase
            .from("recipe_comments") as any)
            .insert(commentData);

        if (error) {
            throw error;
        }
    };

    return useMutation(addComment, {
        onSuccess: (_, variables) => {
            // Invalidate and refetch comments for this recipe
            queryClient.invalidateQueries(["recipe-comments", variables.recipe_id]);
        },
    });
};

export default useAddComment;
