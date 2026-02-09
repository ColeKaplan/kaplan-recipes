import React, { useState } from "react";
import { RecipeComment } from "../hooks/useRecipeComments";
import useAddComment from "../hooks/useAddComment";

interface CommentItemProps {
    comment: RecipeComment;
    recipeId: string;
    depth?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, recipeId, depth = 0 }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [replyAuthorName, setReplyAuthorName] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [showReplies, setShowReplies] = useState(true);

    const { mutate: addComment, isLoading: isSubmitting } = useAddComment();

    const handleSubmitReply = (e: React.FormEvent) => {
        e.preventDefault();

        if (!replyText.trim()) return;

        addComment(
            {
                recipe_id: recipeId,
                comment_text: replyText.trim(),
                author_name: isAnonymous ? null : replyAuthorName.trim() || null,
                parent_comment_id: comment.id,
            },
            {
                onSuccess: () => {
                    setReplyText("");
                    setReplyAuthorName("");
                    setIsReplying(false);
                    setIsAnonymous(true);
                },
            }
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return "just now";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
        });
    };

    const maxDepth = 3; // Limit nesting depth
    const canReply = depth < maxDepth;

    return (
        <div className={`${depth > 0 ? "ml-8 mt-4" : "mt-6"}`}>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                {/* Comment Header */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                            {comment.author_name ? comment.author_name[0].toUpperCase() : "A"}
                        </div>
                        <div>
                            <span className="font-semibold text-gray-900">
                                {comment.author_name || "Anonymous"}
                            </span>
                            <span className="text-gray-500 text-sm ml-2">
                                {formatDate(comment.created_at)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Comment Text */}
                <p className="text-gray-800 whitespace-pre-wrap break-words">
                    {comment.comment_text}
                </p>

                {/* Action Buttons */}
                <div className="mt-3 flex items-center space-x-4">
                    {canReply && (
                        <button
                            onClick={() => setIsReplying(!isReplying)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                            {isReplying ? "Cancel" : "Reply"}
                        </button>
                    )}
                    {comment.replies && comment.replies.length > 0 && (
                        <button
                            onClick={() => setShowReplies(!showReplies)}
                            className="text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
                        >
                            {showReplies ? "Hide" : "Show"} {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
                        </button>
                    )}
                </div>

                {/* Reply Form */}
                {isReplying && (
                    <form onSubmit={handleSubmitReply} className="mt-4 space-y-3">
                        <div className="flex items-center space-x-3">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isAnonymous}
                                    onChange={(e) => setIsAnonymous(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Post anonymously</span>
                            </label>
                        </div>

                        {!isAnonymous && (
                            <input
                                type="text"
                                value={replyAuthorName}
                                onChange={(e) => setReplyAuthorName(e.target.value)}
                                placeholder="Your name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                maxLength={50}
                            />
                        )}

                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write your reply..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            maxLength={2000}
                            required
                        />

                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                                {replyText.length}/2000
                            </span>
                            <button
                                type="submit"
                                disabled={isSubmitting || !replyText.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                {isSubmitting ? "Posting..." : "Post Reply"}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Nested Replies */}
            {showReplies && comment.replies && comment.replies.length > 0 && (
                <div className="mt-2">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            recipeId={recipeId}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentItem;
