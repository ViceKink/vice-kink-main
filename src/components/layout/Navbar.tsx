
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import { 
  Home, 
  Search, 
  MessagesSquare, 
  User, 
  Settings, 
  LogOut, 
  Menu,
  Coins
} from 'lucide-react';
import { useAuth } from '@/context/auth';
import Logo from '../ui/Logo';
import { useIsMobile } from '@/hooks/use-mobile';
import AdCoinsBalance from '@/components/adcoins/AdCoinsBalance';

const Navbar = () => {
  const { user, logout } = useAuth(); // Changed signOut to logout to match the Auth context
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleSignOut = () => {
    logout(); // Changed from signOut to logout
    navigate('/');
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    {
      label: 'Home',
      path: '/',
      icon: <Home className="h-4 w-4" />,
    },
    {
      label: 'Discover',
      path: '/discover',
      icon: <Search className="h-4 w-4" />,
      authRequired: true,
    },
    {
      label: 'Messages',
      path: '/messages',
      icon: <MessagesSquare className="h-4 w-4" />,
      authRequired: true,
    },
  ];
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b h-16 flex items-center">
      <div className="container flex items-center justify-between h-full">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Logo className="h-8" />
            <span className="font-bold text-lg">Flirtify</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              !item.authRequired || user ? (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center gap-1"
                  asChild
                >
                  <Link to={item.path}>
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </Button>
              ) : null
            ))}
          </nav>
        )}
        
        <div className="flex items-center space-x-2">
          {user && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden md:flex"
            >
              <Link to="/adcoins">
                <AdCoinsBalance size="sm" />
              </Link>
            </Button>
          )}
          
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name || 'User'} />
                      <AvatarFallback>{(user.name || 'User').charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/adcoins')}>
                      <Coins className="mr-2 h-4 w-4" />
                      <span>AdCoins</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Mobile Menu */}
              {isMobile && (
                <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[60vh]">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-6 pt-2">
                        <h3 className="text-lg font-semibold">Menu</h3>
                        <Link to="/adcoins">
                          <AdCoinsBalance showEarnButton={true} />
                        </Link>
                      </div>
                      
                      <nav className="grid grid-cols-3 gap-4">
                        {navItems.map((item) => (
                          <SheetClose key={item.path} asChild>
                            <Button
                              variant={isActive(item.path) ? "default" : "outline"}
                              className="flex flex-col items-center justify-center h-20 w-full"
                              onClick={() => navigate(item.path)}
                            >
                              {item.icon}
                              <span className="mt-1 text-xs">{item.label}</span>
                            </Button>
                          </SheetClose>
                        ))}
                        
                        <SheetClose asChild>
                          <Button
                            variant={isActive('/profile') ? "default" : "outline"}
                            className="flex flex-col items-center justify-center h-20 w-full"
                            onClick={() => navigate('/profile')}
                          >
                            <User className="h-4 w-4" />
                            <span className="mt-1 text-xs">Profile</span>
                          </Button>
                        </SheetClose>
                        
                        <SheetClose asChild>
                          <Button
                            variant={isActive('/adcoins') ? "default" : "outline"}
                            className="flex flex-col items-center justify-center h-20 w-full"
                            onClick={() => navigate('/adcoins')}
                          >
                            <Coins className="h-4 w-4" />
                            <span className="mt-1 text-xs">AdCoins</span>
                          </Button>
                        </SheetClose>
                        
                        <SheetClose asChild>
                          <Button
                            variant={isActive('/settings') ? "default" : "outline"}
                            className="flex flex-col items-center justify-center h-20 w-full"
                            onClick={() => navigate('/settings')}
                          >
                            <Settings className="h-4 w-4" />
                            <span className="mt-1 text-xs">Settings</span>
                          </Button>
                        </SheetClose>
                      </nav>
                      
                      <div className="mt-auto pb-6 pt-4">
                        <SheetClose asChild>
                          <Button
                            variant="destructive"
                            className="w-full"
                            onClick={handleSignOut}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            <span>Log out</span>
                          </Button>
                        </SheetClose>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden md:inline-flex"
              >
                <Link to="/auth?mode=sign-in">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/auth?mode=sign-up">Sign up</Link>
              </Button>
              
              {/* Mobile Menu for Non-logged in users */}
              {isMobile && (
                <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[40vh]">
                    <div className="flex flex-col h-full">
                      <h3 className="text-lg font-semibold mb-6 pt-2">Menu</h3>
                      
                      <nav className="grid grid-cols-1 gap-4">
                        <SheetClose asChild>
                          <Button
                            variant={isActive('/') ? "default" : "outline"}
                            className="flex items-center justify-start h-12"
                            onClick={() => navigate('/')}
                          >
                            <Home className="h-4 w-4 mr-2" />
                            <span>Home</span>
                          </Button>
                        </SheetClose>
                        
                        <SheetClose asChild>
                          <Button
                            variant="default"
                            className="flex items-center justify-start h-12"
                            onClick={() => navigate('/auth?mode=sign-in')}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            <span>Log in</span>
                          </Button>
                        </SheetClose>
                        
                        <SheetClose asChild>
                          <Button
                            variant="default"
                            className="flex items-center justify-start h-12"
                            onClick={() => navigate('/auth?mode=sign-up')}
                          >
                            <User className="h-4 w-4 mr-2" />
                            <span>Sign up</span>
                          </Button>
                        </SheetClose>
                      </nav>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
