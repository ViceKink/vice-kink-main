
import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Heart, MessageSquare, Settings, PlusCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/auth';
import CreatePostModal from '@/components/post/CreatePostModal';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const handleCreatePost = (content: string, type: 'text' | 'comic', comicData?: any) => {
    console.log('Creating post:', { content, type, comicData });
    // In a real implementation, this would call an API to create the post
    setCreatePostOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-background/80 backdrop-blur-lg shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between">
            <NavLink to="/" className="text-xl font-semibold flex items-center">
              <span className="text-vice-purple mr-1 transition-all duration-300 hover:text-vice-dark-purple">Vice</span>
              <span className="text-foreground transition-all duration-300 hover:text-vice-gray">Kink</span>
            </NavLink>
            
            {isAuthenticated && (
              <nav className="hidden md:flex space-x-8 text-sm font-medium">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `transition-colors hover:text-vice-purple ${
                      isActive ? 'text-vice-purple' : 'text-foreground/80'
                    }`
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to="/discover"
                  className={({ isActive }) =>
                    `transition-colors hover:text-vice-purple ${
                      isActive ? 'text-vice-purple' : 'text-foreground/80'
                    }`
                  }
                >
                  Discover
                </NavLink>
                <NavLink
                  to="/messages"
                  className={({ isActive }) =>
                    `transition-colors hover:text-vice-purple ${
                      isActive ? 'text-vice-purple' : 'text-foreground/80'
                    }`
                  }
                >
                  Messages
                </NavLink>
              </nav>
            )}
            
            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <Button 
                  variant="ghost" 
                  onClick={() => setCreatePostOpen(true)}
                  className="h-10 w-10 md:h-11 md:w-auto md:px-4 rounded-full hover:bg-vice-purple/10 text-foreground/80 hover:text-vice-purple"
                >
                  <PlusCircle className="h-6 w-6 md:mr-2" />
                  <span className="hidden md:inline">Create Post</span>
                </Button>
              )}
              {isAuthenticated && (
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `flex items-center justify-center h-10 w-10 rounded-full transition-colors hover:bg-vice-purple/10 ${
                      isActive ? 'bg-vice-purple/20 text-vice-purple' : 'text-foreground/80'
                    }`
                  }
                >
                  <Avatar className="h-9 w-9">
                    {user?.photos && user.photos.length > 0 ? (
                      <AvatarImage src={user.photos[0]} alt={user?.name || 'Profile'} />
                    ) : (
                      <AvatarFallback className="bg-vice-purple/10 text-vice-purple">
                        {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="sr-only">Profile</span>
                </NavLink>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Bottom Navigation */}
        {isAuthenticated && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border z-50">
            <div className="flex justify-around items-center h-16">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-full h-full transition-colors ${
                    isActive ? 'text-vice-purple' : 'text-foreground/60'
                  }`
                }
              >
                <Home className="h-5 w-5" />
                <span className="text-xs mt-1">Home</span>
              </NavLink>
              
              <NavLink
                to="/discover"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-full h-full transition-colors ${
                    isActive ? 'text-vice-purple' : 'text-foreground/60'
                  }`
                }
              >
                <Heart className="h-5 w-5" />
                <span className="text-xs mt-1">Discover</span>
              </NavLink>
              
              <NavLink
                to="/messages"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-full h-full transition-colors ${
                    isActive ? 'text-vice-purple' : 'text-foreground/60'
                  }`
                }
              >
                <MessageSquare className="h-5 w-5" />
                <span className="text-xs mt-1">Messages</span>
              </NavLink>
              
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-full h-full transition-colors ${
                    isActive ? 'text-vice-purple' : 'text-foreground/60'
                  }`
                }
              >
                <Settings className="h-5 w-5" />
                <span className="text-xs mt-1">Settings</span>
              </NavLink>
            </div>
          </div>
        )}
      </header>

      {createPostOpen && (
        <CreatePostModal 
          onClose={() => setCreatePostOpen(false)}
          onPost={handleCreatePost}
        />
      )}
    </>
  );
};

export default Navbar;
