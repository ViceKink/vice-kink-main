
import React from 'react';

const PostsLoading = () => {
  return (
    <div className="animate-pulse space-y-6 w-full max-w-xl mx-auto">
      <div className="h-8 w-40 bg-gray-300 rounded mx-auto"></div>
      <div className="h-64 bg-gray-300 rounded"></div>
      <div className="h-64 bg-gray-300 rounded"></div>
    </div>
  );
};

export default PostsLoading;
