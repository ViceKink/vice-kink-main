
import React from 'react';
import { PostCard } from '@/components/post/PostCard';
import { NoResultsFound, NoPostsYet } from '@/components/post/EmptyStates';

interface PostListProps {
  posts: any[];
  searchQuery: string;
  onClearSearch: () => void;
  onCreatePost: () => void;
}

const PostList = ({ posts, searchQuery, onClearSearch, onCreatePost }: PostListProps) => {
  if (posts.length === 0) {
    return searchQuery ? (
      <NoResultsFound searchQuery={searchQuery} onClearSearch={onClearSearch} />
    ) : (
      <NoPostsYet onCreatePost={onCreatePost} />
    );
  }

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostList;
