import React, { useState } from "react";
import useRecipeComments from "../hooks/useRecipeComments";
import useAddComment from "../hooks/useAddComment";
import CommentItem from "./CommentItem";

interface CommentsSectionProps {
    recipeId: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ recipeId }) => {
    const { data: comments, isLoading, isError } = useRecipeComments(recipeId);
    const { mutate: addComment, isLoading: isSubmitting } = useAddComment();

    const [commentText, setCommentText] = useState("");
    const [authorName, setAuthorName] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!commentText.trim()) return;

        addComment(
            {
                recipe_id: recipeId,
                comment_text: commentText.trim(),
                author_name: isAnonymous ? null : authorName.trim() || null,
            },
            {
                onSuccess: () => {
                    setCommentText("");
                    setAuthorName("");
                    setIsAnonymous(true);
                },
            }
        );
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-4xl mx-auto mt-12 p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-24 bg-gray-200 rounded"></div>
                        <div className="h-24 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="w-full max-w-4xl mx-auto mt-12 p-6">
                <p className="text-red-600">Failed to load comments. Please try again later.</p>
            </div>
        );
    }

    const commentCount = comments?.length || 0;

    return (
        <div className="w-full max-w-4xl mx-auto mt-12 mb-8 px-6">
            {/* Section Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Comments {commentCount > 0 && `(${commentCount})`}
                </h2>
            </div>

            {/* Add Comment Form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Leave a Comment</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Anonymous Checkbox */}
                    <div className="flex items-center space-x-3">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 font-medium">Post anonymously</span>
                        </label>
                    </div>

                    {/* Name Input (shown when not anonymous) */}
                    {!isAnonymous && (
                        <div>
                            <label htmlFor="author-name" className="block text-sm font-medium text-gray-700 mb-1">
                                Your Name
                            </label>
                            <input
                                id="author-name"
                                type="text"
                                value={authorName}
                                onChange={(e) => setAuthorName(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                maxLength={50}
                            />
                        </div>
                    )}

                    {/* Comment Text Area */}
                    <div>
                        <label htmlFor="comment-text" className="block text-sm font-medium text-gray-700 mb-1">
                            Comment
                        </label>
                        <textarea
                            id="comment-text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Share your thoughts about this recipe..."
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            maxLength={2000}
                            required
                        />
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500">
                                {commentText.length}/2000 characters
                            </span>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting || !commentText.trim()}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {isSubmitting ? "Posting..." : "Post Comment"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Comments List */}
            <div className="space-y-2">
                {comments && comments.length > 0 ? (
                    comments.map((comment) => (
                        <CommentItem key={comment.id} comment={comment} recipeId={recipeId} />
                    ))
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400 mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                        <p className="text-gray-600 font-medium">No comments yet</p>
                        <p className="text-gray-500 text-sm mt-1">Be the first to share your thoughts!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentsSection;
