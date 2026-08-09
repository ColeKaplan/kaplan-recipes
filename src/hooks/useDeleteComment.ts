import { useMutation, useQueryClient } from "react-query";
import { api } from "../lib/api";

interface DeleteCommentParams {
    commentId: string;
    recipeId: string;
}

const useDeleteComment = () => {
    const queryClient = useQueryClient();

    const deleteComment = async ({ commentId }: DeleteCommentParams): Promise<void> => {
        await api.comments.delete(commentId);
    };

    return useMutation(deleteComment, {
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(["recipe-comments", variables.recipeId]);
        },
    });
};

export default useDeleteComment;
