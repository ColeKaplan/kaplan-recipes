import { useMutation, useQueryClient } from "react-query";
import { api } from "../lib/api";

interface AddCommentParams {
    recipe_id: string;
    comment_text: string;
    author_name?: string | null;
    parent_comment_id?: string | null;
}

const useAddComment = () => {
    const queryClient = useQueryClient();

    const addComment = async (params: AddCommentParams): Promise<void> => {
        await api.comments.add(params);
    };

    return useMutation(addComment, {
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(["recipe-comments", variables.recipe_id]);
        },
    });
};

export default useAddComment;
