
import React from 'react';
import { PostCard } from '@/components/post/PostCard';
import { Button } from '@/components/ui/button';

interface ProfilePostsProps {
  userPosts: any[];
  isCurrentUser: boolean;
  onCreatePost: () => void;
}

const ProfilePosts = ({ userPosts, isCurrentUser, onCreatePost }: ProfilePostsProps) => {
  return (
    <div className="space-y-6">
      {userPosts && userPosts.length === 0 ? (
        <div className="p-8 bg-white dark:bg-card rounded-2xl shadow-md text-center">
          <h3 className="text-xl font-bold mb-4">No Posts Yet</h3>
          <p className="text-foreground/70 mb-6">
            {isCurrentUser 
              ? "You haven't created any posts yet. Share your thoughts or stories!" 
              : "This user hasn't created any posts yet."}
          </p>
          {isCurrentUser && (
            <Button 
              className="bg-vice-purple hover:bg-vice-dark-purple"
              onClick={onCreatePost}
            >
              Create Post
            </Button>
          )}
        </div>
      ) : (
        userPosts && userPosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))
      )}
    </div>
  );
};

export default ProfilePosts;
