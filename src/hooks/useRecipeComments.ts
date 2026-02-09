import { useQuery } from "react-query";
import { supabase } from "../lib/supabase";
import { Database } from "../types/database";

type CommentRow = Database["public"]["Tables"]["recipe_comments"]["Row"];

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
        if (!recipeId) {
            throw new Error("Recipe ID is required");
        }

        // Fetch all comments for this recipe
        const { data: comments, error } = await supabase
            .from("recipe_comments")
            .select("*")
            .eq("recipe_id", recipeId)
            .order("created_at", { ascending: true });

        if (error) {
            throw error;
        }

        if (!comments) {
            return [];
        }

        // Organize comments into a tree structure
        const commentMap = new Map<string, RecipeComment>();
        const topLevelComments: RecipeComment[] = [];

        // First pass: create all comment objects
        comments.forEach((comment: CommentRow) => {
            commentMap.set(comment.id, {
                ...comment,
                replies: [],
            });
        });

        // Second pass: organize into tree structure
        comments.forEach((comment: CommentRow) => {
            const commentObj = commentMap.get(comment.id)!;

            if (comment.parent_comment_id) {
                // This is a reply
                const parent = commentMap.get(comment.parent_comment_id);
                if (parent) {
                    parent.replies!.push(commentObj);
                }
            } else {
                // This is a top-level comment
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
            staleTime: 30000, // 30 seconds
            cacheTime: 300000, // 5 minutes
            enabled: !!recipeId,
        }
    );
};

export default useRecipeComments;
