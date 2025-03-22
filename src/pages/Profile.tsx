
import { useEffect } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { ChevronLeft, Settings } from 'lucide-react';
import BentoProfile from '@/components/ui/BentoProfile';
import { useAuth } from '@/context/AuthContext';

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
  const isCurrentUser = !id || id === user?.id;
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);
  
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading Profile...</h2>
          <p className="text-sm text-foreground/70">Please wait a moment</p>
        </div>
      </div>
    );
  }
  
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
            <button className="px-4 py-2 rounded-full bg-secondary text-foreground/80 hover:bg-secondary/80 transition-colors">
              Persona
            </button>
            <button className="px-4 py-2 rounded-full bg-secondary/50 text-foreground/80 hover:bg-secondary/80 transition-colors">
              Erotics
            </button>
          </div>
        </div>
        
        <BentoProfile 
          profile={user}
          isCurrentUser={isCurrentUser}
        />
      </div>
    </div>
  );
};

export default Profile;
