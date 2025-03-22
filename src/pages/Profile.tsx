
import { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { ChevronLeft, Settings, Tabs } from 'lucide-react';
import BentoProfile from '@/components/ui/BentoProfile';
import { useAuth } from '@/context/AuthContext';
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const { id } = useParams();
  const { user, fetchProfile } = useAuth();
  const [profileUser, setProfileUser] = useState(user);
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
