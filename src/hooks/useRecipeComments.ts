import { useQuery } from "react-query";
import { api } from "../lib/api";

export interface RecipeComment {
    id: string;
    recipe_id: string;
    parent_comment_id: string | null;
    author_name: string | null;
    comment_text: string;
    created_at: string;
    updated_at: string;
    replies?: RecipeComment[];
}

const useRecipeComments = (recipeId: string | undefined) => {
    const fetchComments = async (): Promise<RecipeComment[]> => {
        if (!recipeId) throw new Error("Recipe ID is required");

        const comments = await api.comments.getByRecipe(recipeId);
        if (!comments) return [];

        // Organize into tree structure (same logic as before)
        const commentMap = new Map<string, RecipeComment>();
        const topLevelComments: RecipeComment[] = [];

        comments.forEach((comment: any) => {
            commentMap.set(comment.id, { ...comment, replies: [] });
        });

        comments.forEach((comment: any) => {
            const commentObj = commentMap.get(comment.id)!;
            if (comment.parent_comment_id) {
                const parent = commentMap.get(comment.parent_comment_id);
                if (parent) parent.replies!.push(commentObj);
            } else {
                topLevelComments.push(commentObj);
            }
        });

        return topLevelComments;
    };

    return useQuery<RecipeComment[], Error>(
        ["recipe-comments", recipeId],
        fetchComments,
        {
            refetchOnWindowFocus: false,
            staleTime: 30000,
            cacheTime: 300000,
            enabled: !!recipeId,
        }
    );
};

export default useRecipeComments;
