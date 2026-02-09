# Comments Feature Implementation

## Overview
A complete comments section has been added to the recipe pages, allowing users to leave comments and replies on recipes. Users can choose to post anonymously or with a name.

## Features Implemented

### 1. Database Schema
- **Table**: `recipe_comments`
- **Columns**:
  - `id`: UUID primary key
  - `recipe_id`: References the recipe
  - `parent_comment_id`: NULL for top-level comments, references parent for replies
  - `author_name`: NULL for anonymous, or the user's display name
  - `comment_text`: The comment content (max 2000 characters)
  - `created_at`: Timestamp
  - `updated_at`: Timestamp

### 2. Custom Hooks

#### `useRecipeComments` (`src/hooks/useRecipeComments.ts`)
- Fetches all comments for a recipe
- Organizes comments into a tree structure with nested replies
- Uses React Query for caching and automatic refetching

#### `useAddComment` (`src/hooks/useAddComment.ts`)
- Handles adding new comments or replies
- Automatically invalidates and refetches comments after posting
- Supports both anonymous and named comments

### 3. UI Components

#### `CommentsSection` (`src/components/CommentsSection.tsx`)
- Main comments section component
- Displays comment count
- Form to add new top-level comments
- Anonymous/named toggle
- Character counter (2000 max)
- Empty state when no comments exist

#### `CommentItem` (`src/components/CommentItem.tsx`)
- Individual comment display
- Shows author avatar, name (or "Anonymous"), and timestamp
- Relative time formatting (e.g., "2h ago", "3d ago")
- Reply button and form
- Nested reply support (max 3 levels deep)
- Collapsible replies with count
- Character counter for replies

### 4. Features

✅ **Anonymous Comments**: Users can post without providing a name
✅ **Named Comments**: Users can optionally provide their name
✅ **Threaded Replies**: Comments can have nested replies (up to 3 levels)
✅ **Real-time Updates**: Comments refresh automatically after posting
✅ **Character Limits**: 2000 character limit with live counter
✅ **Time Formatting**: Smart relative time display
✅ **Responsive Design**: Works on mobile and desktop
✅ **Loading States**: Skeleton loading while fetching
✅ **Error Handling**: Graceful error messages
✅ **Empty States**: Friendly message when no comments exist

### 5. User Experience

- **Avatar Generation**: Colorful gradient avatars with first letter of name
- **Collapsible Replies**: Can show/hide replies to keep the page clean
- **Reply Depth Limit**: Prevents infinite nesting (max 3 levels)
- **Smooth Interactions**: Hover effects and transitions
- **Accessibility**: Proper labels and semantic HTML

## How to Use

1. Navigate to any recipe page
2. Scroll to the bottom to see the comments section
3. To add a comment:
   - Check "Post anonymously" to post without a name
   - Or uncheck it and enter your name
   - Type your comment (max 2000 characters)
   - Click "Post Comment"
4. To reply to a comment:
   - Click "Reply" on any comment
   - Fill out the reply form
   - Click "Post Reply"
5. To view/hide replies:
   - Click "Show/Hide X replies" button

## Database Policies

The Supabase RLS policies allow:
- ✅ Anyone can read comments
- ✅ Anyone can insert comments (no authentication required)
- ❌ Update/delete not implemented (as requested)

## Technical Notes

- Uses React Query for efficient data fetching and caching
- TypeScript types are fully defined in `database.ts`
- Comments are fetched once and cached for 30 seconds
- Tree structure is built client-side for optimal performance
- Proper error boundaries and loading states throughout
