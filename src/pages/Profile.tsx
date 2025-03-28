import React, { useEffect, useState, useCallback } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Settings, RefreshCw, Pencil, Heart, X, Star } from 'lucide-react';
import BentoProfile from '@/components/ui/BentoProfile';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { UserProfile } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { PostCard } from '@/components/post/PostCard';
import CreatePostModal from '@/components/post/CreatePostModal';
import { createInteraction } from '@/utils/matchUtils';
import MatchAnimation from '@/components/match/MatchAnimation';
import { cn } from '@/lib/utils';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, fetchProfile, isAuthenticated, isLoading: authLoading } = useAuth();
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'persona' | 'erotica'>('persona');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<{id: string; name: string; avatar?: string} | null>(null);
  const queryClient = useQueryClient();
  
  const isCurrentUser = !id || id === user?.id;
  const profileId = id || user?.id;

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
  
  const handleRetry = () => {
    setLoadingTimeout(false);
    setIsLoading(true);
    setLoadingProgress(0);
    getProfileData();
  };
  
  const handleTabChange = (tab: 'persona' | 'erotica') => {
    setActiveTab(tab);
  };
  
  const handleCreatePost = () => {
    setShowCreatePostModal(true);
  };
  
  if (authLoading) {
    console.log("Auth loading...");
    return (
      <div className="flex min-h-screen items-center justify-center flex-col p-4">
        <div className="text-center mb-4 max-w-md">
          <h2 className="text-2xl font-semibold mb-2">Loading Profile...</h2>
          <p className="text-sm text-foreground/70 mb-6">Checking authentication</p>
          <div className="w-full">
            <Progress value={25} className="w-full h-2" />
          </div>
        </div>
      </div>
    );
  }
  
  if (loadingTimeout && isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col p-4">
        <div className="text-center mb-4 max-w-md">
          <h2 className="text-2xl font-semibold mb-2">Loading is taking longer than expected</h2>
          <p className="text-sm text-foreground/70 mb-6">
            There might be an issue loading your profile data
          </p>
          <div className="w-full mb-6">
            <Progress value={loadingProgress} className="w-full h-2" />
          </div>
          <Button 
            onClick={handleRetry}
            className="bg-vice-purple hover:bg-vice-dark-purple flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </Button>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    console.log("Profile data loading...");
    return (
      <div className="flex min-h-screen items-center justify-center flex-col p-4">
        <div className="text-center mb-4 max-w-md">
          <h2 className="text-2xl font-semibold mb-2">Loading Profile...</h2>
          <p className="text-sm text-foreground/70 mb-6">Please wait a moment</p>
          <div className="w-full">
            <Progress value={loadingProgress} className="w-full h-2" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold mb-4">Something went wrong</h2>
          <p className="text-foreground/70 mb-6">{error}</p>
          <Button 
            className="bg-vice-purple hover:bg-vice-dark-purple"
            onClick={handleRetry}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  if (isCurrentUser && !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold mb-4">Sign in to view your profile</h2>
          <p className="text-foreground/70 mb-6">
            You need to be signed in to view and manage your profile.
          </p>
          <Button 
            className="bg-vice-purple hover:bg-vice-dark-purple"
            onClick={() => navigate('/auth')}
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }
  
  if (!profileUser) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold mb-4">Profile Not Found</h2>
          <p className="text-foreground/70 mb-6">
            We couldn't find the profile you're looking for.
          </p>
          <Button 
            className="bg-vice-purple hover:bg-vice-dark-purple"
            onClick={() => navigate('/discover')}
          >
            Back to Discover
          </Button>
        </div>
      </div>
    );
  }
  
  console.log("Rendering profile content", { 
    profileId: profileUser?.id, 
    name: profileUser?.name,
    isCurrentUser
  });
  
  return (
    <div className="min-h-screen pt-16 pb-20 px-2">
      <div className="w-full mx-auto">
        <div className="flex justify-between items-center mb-4">
          {!isCurrentUser ? (
            <NavLink
              to="/discover"
              className="flex items-center text-foreground/70 hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Discover
            </NavLink>
          ) : (
            <div className="flex items-center">
              <div className="bg-vice-purple/20 text-vice-purple px-3 py-1 rounded-full text-sm">
                My Profile
              </div>
            </div>
          )}
          
          {isCurrentUser && (
            <NavLink
              to="/edit-profile"
              className="flex items-center text-foreground/70 hover:text-foreground transition-colors"
            >
              <Pencil className="w-5 h-5 mr-1" />
              Edit Profile
            </NavLink>
          )}
        </div>
        
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-2 bg-secondary/30 p-1 rounded-xl">
            <button 
              className={`px-4 py-3 rounded-lg flex justify-center items-center transition-all ${
                activeTab === 'persona' 
                  ? 'bg-white dark:bg-black text-foreground shadow-sm font-semibold' 
                  : 'bg-transparent text-foreground/60 hover:text-foreground/80'
              }`}
              onClick={() => handleTabChange('persona')}
            >
              <span className="font-medium">Persona</span>
            </button>
            <button 
              className={`px-4 py-3 rounded-lg flex justify-center items-center transition-all ${
                activeTab === 'erotica' 
                  ? 'bg-black text-white shadow-sm' 
                  : 'bg-transparent text-foreground/60 hover:text-foreground/80'
              }`}
              onClick={() => handleTabChange('erotica')}
            >
              <span className="font-medium">Erotica</span>
            </button>
          </div>
        </div>
        
        {activeTab === 'persona' && profileUser ? (
          <BentoProfile 
            profile={profileUser}
            isCurrentUser={isCurrentUser}
          />
        ) : activeTab === 'erotica' ? (
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
                    onClick={handleCreatePost}
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
        ) : null}
      </div>
      
      {!isCurrentUser && (
        <div className="fixed bottom-24 right-4 flex flex-col gap-3 z-10">
          <button 
            onClick={handleDislike}
            className={cn(
              "w-11 h-11 rounded-full bg-black shadow-lg flex items-center justify-center",
              "transform transition-transform hover:scale-105 border-2 border-red-500 animate-fade-in",
              "animate-float"
            )}
            aria-label="Dislike profile"
          >
            <X className="w-5 h-5 text-red-500" />
          </button>
          
          <button 
            onClick={handleSuperLike}
            className={cn(
              "w-11 h-11 rounded-full bg-black shadow-lg flex items-center justify-center",
              "transform transition-transform hover:scale-105 border-2 border-orange-500 animate-fade-in delay-75",
              "animate-float delay-75"
            )}
            aria-label="Super like profile"
          >
            <Star className="w-5 h-5 text-orange-500" />
          </button>
          
          <button 
            onClick={handleLike}
            className={cn(
              "w-11 h-11 rounded-full bg-black shadow-lg flex items-center justify-center",
              "transform transition-transform hover:scale-105 border-2 border-purple-500 animate-fade-in delay-150",
              "animate-float delay-150"
            )}
            aria-label="Like profile"
          >
            <Heart className="w-5 h-5 text-purple-500" />
          </button>
        </div>
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
