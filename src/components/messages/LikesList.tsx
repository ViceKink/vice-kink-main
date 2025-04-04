
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Likes } from '@/components/messages/likes';

interface LikesListProps {
  likes: any[];
  isLoading: boolean;
}

const LikesList: React.FC<LikesListProps> = ({ likes, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="w-full h-24" />
        ))}
      </div>
    );
  }

  if (likes.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">✨</div>
        <h3 className="text-xl font-semibold mb-2">No likes yet</h3>
        <p className="text-sm text-muted-foreground">
          When someone likes you, they'll appear here
        </p>
      </div>
    );
  }

  // Ensure that likes data contains the is_revealed property
  const likesWithRevealState = likes.map(like => ({
    ...like,
    is_revealed: like.is_revealed !== undefined ? like.is_revealed : false
  }));

  return <Likes likes={likesWithRevealState} />;
};

export default LikesList;
