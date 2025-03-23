
import React, { useEffect, useState } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Settings, RefreshCw, Pencil } from 'lucide-react';
import BentoProfile from '@/components/ui/BentoProfile';
import { useAuth, UserProfile } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, fetchProfile, isAuthenticated, isLoading: authLoading } = useAuth();
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'persona' | 'erotics'>('persona');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const isCurrentUser = !id || id === user?.id;
  
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
      }, 15000);
      
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    } else {
      setLoadingProgress(100);
    }
  }, [isLoading]);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    console.log("Profile component loaded", {
      id,
      userId: user?.id,
      isAuthenticated,
      authLoading
    });
    
    const getProfileData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Attempting to fetch profile data", { id, userId: user?.id, isAuthenticated });
        let profile = null;
        
        if (id && id !== user?.id) {
          console.log("Fetching other user's profile", { id });
          profile = await fetchProfile(id);
        } else if (user) {
          console.log("Using current user's profile", { userId: user.id });
          profile = user;
        } else if (isAuthenticated) {
          console.log("Fetching current user's profile (authenticated but no user data)");
          profile = await fetchProfile();
        }
        
        console.log("Profile data fetched:", profile);
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
      }
    };
    
    if (!authLoading) {
      getProfileData();
    }
  }, [id, user, fetchProfile, isAuthenticated, authLoading]);
  
  const handleRetry = () => {
    setLoadingTimeout(false);
    setIsLoading(true);
    setLoadingProgress(0);
    window.location.reload();
  };
  
  const handleTabChange = (tab: 'persona' | 'erotics') => {
    setActiveTab(tab);
  };
  
  if (authLoading) {
    console.log("Profile page: Auth loading...");
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
    console.log("Profile page: Profile data loading...");
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
            onClick={() => window.location.reload()}
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
  
  console.log("Profile page: Rendering profile content", { 
    profileId: profileUser.id, 
    name: profileUser.name,
    isCurrentUser
  });
  
  return (
    <div className="min-h-screen pt-20 pb-28 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
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
        
        <div className="mb-4">
          <div className="flex space-x-4">
            <button 
              className={`px-4 py-2 rounded-full ${activeTab === 'persona' ? 'bg-secondary text-foreground/80' : 'bg-secondary/50 text-foreground/80 hover:bg-secondary/80'} transition-colors`}
              onClick={() => handleTabChange('persona')}
            >
              Persona
            </button>
            <button 
              className={`px-4 py-2 rounded-full ${activeTab === 'erotics' ? 'bg-secondary text-foreground/80' : 'bg-secondary/50 text-foreground/80 hover:bg-secondary/80'} transition-colors`}
              onClick={() => handleTabChange('erotics')}
            >
              Erotics
            </button>
          </div>
        </div>
        
        {activeTab === 'persona' ? (
          <BentoProfile 
            profile={profileUser}
            isCurrentUser={isCurrentUser}
          />
        ) : (
          <div className="p-8 bg-white dark:bg-card rounded-2xl shadow-md text-center">
            <h3 className="text-xl font-bold mb-4">Erotics Profile</h3>
            <p className="text-foreground/70">This section is still under development. Coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
