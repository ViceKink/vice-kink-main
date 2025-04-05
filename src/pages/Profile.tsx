
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createInteraction } from '@/utils/matchUtils';

// Custom hooks
import { useProfileData } from '@/hooks/useProfileData';
import { useProfilePosts } from '@/hooks/useProfilePosts';

// Components
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileContent from '@/components/profile/ProfileContent';
import ProfileLoading from '@/components/profile/ProfileLoading';
import ProfileError from '@/components/profile/ProfileError';
import ProfileInteractionButtons from '@/components/profile/ProfileInteractionButtons';
import ProfileMatchHandler from '@/components/profile/ProfileMatchHandler';
import ProfilePostCreationProvider from '@/components/profile/ProfilePostCreationProvider';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State for match animation
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState(null);
  
  // Get profile data using custom hook
  const {
    profileUser,
    isLoading,
    error,
    loadingTimeout,
    loadingProgress,
    isCurrentUser,
    currentProfileId,
    authLoading,
    isAuthenticated,
    handleRetry
  } = useProfileData(id);
  
  // Get user posts using custom hook
  const { data: userPosts = [], isLoading: postsLoading } = useProfilePosts(currentProfileId);
  
  // Interaction mutation
  const interactionMutation = useMutation({
    mutationFn: async ({ 
      profileId, 
      type 
    }: { 
      profileId: string, 
      type: 'like' | 'dislike' | 'superlike' 
    }) => {
      if (!profileUser?.id) throw new Error('User not authenticated');
      const result = await createInteraction(profileUser.id, profileId, type);
      if (!result.success) throw new Error(`Failed to ${type} profile`);
      return { profileId, type, matched: result.matched };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['userInteractions'] });
      queryClient.invalidateQueries({ queryKey: ['discoverProfiles'] });
      
      if (data.type === 'like') {
        toast.success('Profile liked!');
      } else if (data.type === 'superlike') {
        toast.success('Profile super liked!');
      } else {
        toast.success('Profile passed');
      }
      
      if (data.matched && profileUser) {
        setMatchedProfile({
          id: profileUser.id,
          name: profileUser.name,
          avatar: profileUser.avatar
        });
        setShowMatchAnimation(true);
        
        queryClient.invalidateQueries({ queryKey: ['userMatches'] });
        queryClient.invalidateQueries({ queryKey: ['likedByProfiles'] });
      }
    }
  });
  
  // Profile interaction handlers
  const handleLike = () => {
    if (currentProfileId && !isCurrentUser) {
      interactionMutation.mutate({ profileId: currentProfileId, type: 'like' });
    }
  };
  
  const handleDislike = () => {
    if (currentProfileId && !isCurrentUser) {
      interactionMutation.mutate({ profileId: currentProfileId, type: 'dislike' });
    }
  };
  
  const handleSuperLike = () => {
    if (currentProfileId && !isCurrentUser) {
      interactionMutation.mutate({ profileId: currentProfileId, type: 'superlike' });
    }
  };
  
  const handleCloseMatchAnimation = () => {
    setShowMatchAnimation(false);
    setMatchedProfile(null);
  };
  
  // UI navigation handlers
  const navigateToDiscover = () => {
    navigate('/discover');
  };
  
  const navigateToAuth = () => {
    navigate('/auth');
  };
  
  // Create post handler
  const handleCreatePost = () => {
    console.log("Create post triggered from Profile");
    // This function will be used directly if needed
  };
  
  // Return appropriate view based on state
  if (authLoading) {
    console.log("Auth loading...");
    return <ProfileLoading type="auth" progress={25} />;
  }
  
  if (loadingTimeout && isLoading) {
    return <ProfileLoading type="timeout" progress={loadingProgress} onRetry={handleRetry} />;
  }
  
  if (isLoading) {
    console.log("Profile data loading...");
    return <ProfileLoading type="initial" progress={loadingProgress} />;
  }
  
  if (error) {
    return <ProfileError type="error" error={error} onRetry={handleRetry} />;
  }
  
  if (isCurrentUser && !isAuthenticated) {
    return <ProfileError type="unauthenticated" error="" onRetry={navigateToAuth} />;
  }
  
  if (!profileUser) {
    return <ProfileError type="not-found" error="" onRetry={navigateToDiscover} />;
  }
  
  console.log("Rendering profile content", { 
    profileId: profileUser?.id, 
    name: profileUser?.name,
    isCurrentUser
  });
  
  return (
    <div className="min-h-screen pt-16 pb-20 px-2">
      <div className="w-full mx-auto">
        <ProfileHeader 
          isCurrentUser={isCurrentUser} 
          profileId={profileUser?.id} 
          navigateToDiscover={navigateToDiscover} 
        />
        
        <ProfilePostCreationProvider profileId={profileUser?.id}>
          <ProfileContent 
            profileUser={profileUser} 
            isCurrentUser={isCurrentUser} 
            userPosts={userPosts || []} 
            onCreatePost={handleCreatePost}  
          />
        </ProfilePostCreationProvider>
      </div>
      
      {!isCurrentUser && (
        <ProfileInteractionButtons 
          onLike={handleLike} 
          onDislike={handleDislike} 
          onSuperLike={handleSuperLike} 
        />
      )}

      <ProfileMatchHandler
        showMatchAnimation={showMatchAnimation}
        matchedProfile={matchedProfile}
        onClose={handleCloseMatchAnimation}
      />
    </div>
  );
};

export default Profile;
