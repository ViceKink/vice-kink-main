
import { useEffect, useState } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Settings } from 'lucide-react';
import BentoProfile from '@/components/ui/BentoProfile';
import { useAuth, UserProfile } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, fetchProfile, isAuthenticated } = useAuth();
  const [profileUser, setProfileUser] = useState<UserProfile | null>(user);
  const [activeTab, setActiveTab] = useState<'persona' | 'erotics'>('persona');
  const [isLoading, setIsLoading] = useState(false);
  
  const isCurrentUser = !id || id === user?.id;
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // If viewing another user's profile, fetch their data
    const getProfileData = async () => {
      if (id && id !== user?.id) {
        setIsLoading(true);
        try {
          const profile = await fetchProfile(id);
          if (profile) {
            setProfileUser(profile);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setProfileUser(user);
      }
    };
    
    getProfileData();
  }, [id, user, fetchProfile]);
  
  if (isLoading || !profileUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading Profile...</h2>
          <p className="text-sm text-foreground/70">Please wait a moment</p>
        </div>
      </div>
    );
  }
  
  // If trying to view the current user's profile but not authenticated
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
  
  const handleTabChange = (tab: 'persona' | 'erotics') => {
    setActiveTab(tab);
  };
  
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
              to="/settings"
              className="flex items-center text-foreground/70 hover:text-foreground transition-colors"
            >
              <Settings className="w-5 h-5 mr-1" />
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
