
import React from 'react';
import { PostCard } from '@/components/post/PostCard';
import { NoResultsFound, NoPostsYet } from '@/components/post/EmptyStates';

interface PostListProps {
  posts: any[];
  searchQuery: string;
  onClearSearch: () => void;
  onCreatePost: () => void;
  refreshPosts?: () => void; // Added to refresh posts after deletion
}

const PostList = ({ posts, searchQuery, onClearSearch, onCreatePost, refreshPosts }: PostListProps) => {
  // Filter out any posts that might be completely empty
  const validPosts = posts.filter(post => {
    // For comic posts, check if they have any valid comic data
    if (post.type === 'comic' && post.comicData) {
      const hasValidPanels = post.comicData.some(panel => {
        const hasContent = panel.content && panel.content.trim().length > 0;
        const hasTitle = panel.title && panel.title.trim().length > 0;
        const hasImage = !!panel.image;
        const hasBubbles = panel.bubbles && panel.bubbles.length > 0;
        
        return hasContent || hasTitle || hasImage || hasBubbles;
      });
      
      return hasValidPanels;
    }
    
    // For other posts, check if they have content, images or title
    return post.content?.trim() || post.images?.length > 0 || post.title?.trim();
  });
  
  if (validPosts.length === 0) {
    return searchQuery ? (
      <NoResultsFound searchQuery={searchQuery} onClearSearch={onClearSearch} />
    ) : (
      <NoPostsYet onCreatePost={onCreatePost} />
    );
  }

  // Handler for post deletion - will refresh the post list
  const handlePostDelete = () => {
    if (refreshPosts) {
      refreshPosts();
    }
  };

  return (
    <div className="space-y-6">
      {validPosts.map(post => (
        <PostCard key={post.id} post={post} onDelete={handlePostDelete} />
      ))}
    </div>
  );
};

export default PostList;
