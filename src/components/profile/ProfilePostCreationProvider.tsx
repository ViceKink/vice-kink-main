
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
      // Here's the key fix - we're checking the component's props to see if it accepts onCreatePost
      const childType = child.type as any;
      const hasOnCreatePostProp = 
        // Check component's propTypes (React.Component)
        (childType && childType.propTypes && 'onCreatePost' in childType.propTypes) ||
        // For function components, we can't reliably detect if they accept a prop
        // So we check if they're already receiving the prop
        ('onCreatePost' in child.props);
      
      // Only pass the prop if the component seems to accept it
      return React.cloneElement(child, hasOnCreatePostProp ? { 
        ...child.props,
        onCreatePost: handleCreatePost 
      } : child.props);
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
