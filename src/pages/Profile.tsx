
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import CreatePostModal from '@/components/post/CreatePostModal';
import { createInteraction } from '@/utils/matchUtils';
import MatchAnimation from '@/components/match/MatchAnimation';

// Refactored component imports
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileContent from '@/components/profile/ProfileContent';
import ProfileLoading from '@/components/profile/ProfileLoading';
import ProfileError from '@/components/profile/ProfileError';
import ProfileInteractionButtons from '@/components/profile/ProfileInteractionButtons';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, fetchProfile, isAuthenticated, isLoading: authLoading } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState(null);
  const queryClient = useQueryClient();
  
  const isCurrentUser = !id || id === user?.id;
  const profileId = id || user?.id;

  // Fetch user posts
  const { data: userPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['userPosts', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          content,
          created_at,
          likes_count,
          comments_count,
          media_url,
          community_id
        `)
        .eq('user_id', profileId)
        .order('created_at', { ascending: false });
        
      if (postsError) {
        console.error('Error fetching user posts:', postsError);
        return [];
      }
      
      if (postsData.length === 0) return [];
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, avatar')
        .eq('id', profileId)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile for posts:', profileError);
        return postsData.map(post => ({
          ...post,
          images: post.media_url ? [post.media_url] : undefined,
          user: {
            name: 'Anonymous',
            avatar: undefined
          }
        }));
      }
      
      const communityIds = postsData
        .filter(post => post.community_id)
        .map(post => post.community_id);
      
      let communitiesMap = {};
      
      if (communityIds.length > 0) {
        const { data: communitiesData, error: communitiesError } = await supabase
          .from('communities')
          .select('id, name')
          .in('id', communityIds);
        
        if (!communitiesError && communitiesData) {
          communitiesMap = communitiesData.reduce((acc, community) => {
            acc[community.id] = community;
            return acc;
          }, {});
        }
      }
      
      return postsData.map(post => {
        const community = post.community_id ? communitiesMap[post.community_id] : null;
        
        return {
          id: post.id,
          user_id: post.user_id,
          content: post.content,
          images: post.media_url ? [post.media_url] : undefined,
          created_at: post.created_at,
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          community_id: post.community_id,
          community_name: community ? community.name : undefined,
          user: {
            name: profileData?.name || 'Anonymous',
            avatar: profileData?.avatar
          }
        };
      });
    },
    enabled: !!profileId
  });
  
  // Interaction mutation
  const interactionMutation = useMutation({
    mutationFn: async ({ 
      profileId, 
      type 
    }: { 
      profileId: string, 
      type: 'like' | 'dislike' | 'superlike' 
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      const result = await createInteraction(user.id, profileId, type);
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
    if (profileId && !isCurrentUser) {
      interactionMutation.mutate({ profileId, type: 'like' });
    }
  };
  
  const handleDislike = () => {
    if (profileId && !isCurrentUser) {
      interactionMutation.mutate({ profileId, type: 'dislike' });
    }
  };
  
  const handleSuperLike = () => {
    if (profileId && !isCurrentUser) {
      interactionMutation.mutate({ profileId, type: 'superlike' });
    }
  };
  
  const handleCloseMatchAnimation = () => {
    setShowMatchAnimation(false);
    setMatchedProfile(null);
  };
  
  // Loading effects
  useEffect(() => {
    return () => {
      setIsLoading(false);
      setLoadingTimeout(false);
    };
  }, []);
  
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          const newValue = prev + Math.random() * 10;
          return newValue >= 90 ? 90 : newValue;
        });
      }, 400);
      
      const timeout = setTimeout(() => {
        setLoadingTimeout(true);
      }, 10000);
      
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    } else {
      setLoadingProgress(100);
    }
  }, [isLoading]);
  
  // Profile data fetching
  const getProfileData = useCallback(async () => {
    if (fetchAttempts > 3) {
      console.error("Maximum fetch attempts reached");
      setError("Failed to load profile after multiple attempts.");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    console.log("Fetching profile attempt", fetchAttempts + 1);
    
    try {
      let profile = null;
      
      if (isCurrentUser && user) {
        console.log("Using existing user profile:", user);
        profile = user;
      } 
      else {
        console.log("Fetching profile data for", id || "current user");
        profile = await fetchProfile(id);
        console.log("Profile data fetched:", profile);
      }
      
      setProfileUser(profile);
      
      if (!profile && !authLoading && isAuthenticated) {
        setError("Could not load profile data. Please try again.");
        toast.error("Failed to load profile data");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("An error occurred while loading the profile.");
      toast.error("Error loading profile");
    } finally {
      setIsLoading(false);
      setFetchAttempts(prev => prev + 1);
    }
  }, [id, user, fetchProfile, isAuthenticated, authLoading, isCurrentUser, fetchAttempts]);
  
  useEffect(() => {
    if (!authLoading) {
      if (isCurrentUser && !isAuthenticated) {
        console.log("User not authenticated, skipping profile fetch");
        setIsLoading(false);
        return;
      }
      
      if (!isLoading && !profileUser && fetchAttempts === 0) {
        console.log("Initial profile fetch");
        getProfileData();
      }
    }
  }, [authLoading, getProfileData, isAuthenticated, isCurrentUser, isLoading, profileUser, fetchAttempts]);
  
  // Create post modal handler
  const handleCreatePost = () => {
    setShowCreatePostModal(true);
  };
  
  // UI handlers
  const handleRetry = () => {
    setLoadingTimeout(false);
    setIsLoading(true);
    setLoadingProgress(0);
    getProfileData();
  };
  
  const navigateToDiscover = () => {
    navigate('/discover');
  };
  
  const navigateToAuth = () => {
    navigate('/auth');
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
        
        <ProfileContent 
          profileUser={profileUser} 
          isCurrentUser={isCurrentUser} 
          userPosts={userPosts || []} 
          onCreatePost={handleCreatePost} 
        />
      </div>
      
      {!isCurrentUser && (
        <ProfileInteractionButtons 
          onLike={handleLike} 
          onDislike={handleDislike} 
          onSuperLike={handleSuperLike} 
        />
      )}
      
      {showCreatePostModal && (
        <CreatePostModal 
          onClose={() => setShowCreatePostModal(false)}
          onPost={(content, type, comicData) => {
            setShowCreatePostModal(false);
            if (profileUser && profileUser.id) {
              queryClient.invalidateQueries({ queryKey: ['userPosts', profileUser.id] });
            }
          }}
        />
      )}

      {matchedProfile && (
        <MatchAnimation 
          isOpen={showMatchAnimation}
          onClose={handleCloseMatchAnimation}
          matchedProfile={matchedProfile}
        />
      )}
    </div>
  );
};

export default Profile;
