
import React from 'react';
import { Button } from '@/components/ui/button';

interface NoResultsFoundProps {
  searchQuery: string;
  onClearSearch: () => void;
}

export const NoResultsFound = ({ searchQuery, onClearSearch }: NoResultsFoundProps) => {
  return (
    <div className="p-8 bg-white dark:bg-card rounded-2xl shadow-md text-center">
      <h3 className="text-xl font-bold mb-4">No Results Found</h3>
      <p className="text-foreground/70 mb-6">
        No posts match your search for "{searchQuery}"
      </p>
      <Button 
        variant="outline"
        onClick={onClearSearch}
      >
        Clear Search
      </Button>
    </div>
  );
};

interface NoPosstsYetProps {
  onCreatePost: () => void;
}

export const NoPostsYet = ({ onCreatePost }: NoPosstsYetProps) => {
  return (
    <div className="p-8 bg-white dark:bg-card rounded-2xl shadow-md text-center">
      <h3 className="text-xl font-bold mb-4">No Posts Yet</h3>
      <p className="text-foreground/70 mb-6">
        Be the first to create a post and share your thoughts!
      </p>
      <Button 
        className="bg-vice-purple hover:bg-vice-dark-purple"
        onClick={onCreatePost}
      >
        Create Post
      </Button>
    </div>
  );
};
