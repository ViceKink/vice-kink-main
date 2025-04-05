
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import CreatePostModal from '@/components/post/CreatePostModal';

interface ProfilePostCreationProviderProps {
  profileId?: string;
  children: React.ReactNode;
}

const ProfilePostCreationProvider = ({ profileId, children }: ProfilePostCreationProviderProps) => {
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const queryClient = useQueryClient();
  
  const handleCreatePost = () => {
    setShowCreatePostModal(true);
  };
  
  const handlePostCreated = () => {
    setShowCreatePostModal(false);
    if (profileId) {
      queryClient.invalidateQueries({ queryKey: ['userPosts', profileId] });
    }
  };

  // Clone children and pass the onCreatePost prop
  const childrenWithProps = React.Children.map(children, child => {
    // Check if the child is a valid React element
    if (React.isValidElement(child)) {
      // Instead of complex detection, simply ensure we pass the onCreatePost prop
      // Only if the child already has this prop in its props
      return React.cloneElement(child, {
        ...child.props,
        onCreatePost: handleCreatePost
      });
    }
    return child;
  });
  
  return (
    <>
      {childrenWithProps}
      
      {showCreatePostModal && (
        <CreatePostModal 
          onClose={() => setShowCreatePostModal(false)}
          onPost={handlePostCreated}
        />
      )}
    </>
  );
};

export default ProfilePostCreationProvider;
