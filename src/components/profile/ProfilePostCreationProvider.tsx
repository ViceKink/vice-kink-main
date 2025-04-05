
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
  
  return (
    <>
      {React.Children.map(children, child => {
        // Check if the child is a valid React element before cloning
        if (React.isValidElement(child)) {
          // Pass onCreatePost to the child component
          return React.cloneElement(child, { 
            onCreatePost: handleCreatePost 
          });
        }
        return child;
      })}
      
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
