
import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { User, MessageSquare, Heart, Settings } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  
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

  return (
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
          
          <nav className="hidden md:flex space-x-8 text-sm font-medium">
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
              to="/erotics"
              className={({ isActive }) =>
                `transition-colors hover:text-vice-purple ${
                  isActive ? 'text-vice-purple' : 'text-foreground/80'
                }`
              }
            >
              Erotics
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
          
          <div className="flex items-center space-x-4">
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `rounded-full p-2 transition-colors hover:bg-vice-purple/10 ${
                  isActive ? 'bg-vice-purple/20 text-vice-purple' : 'text-foreground/80'
                }`
              }
            >
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </NavLink>
          </div>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border z-50">
        <div className="flex justify-around items-center h-16">
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
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive ? 'text-vice-purple' : 'text-foreground/60'
              }`
            }
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Profile</span>
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
    </header>
  );
};

export default Navbar;
