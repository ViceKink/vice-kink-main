
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

const Auth = () => {
  const {
    login,
    signup,
    isAuthenticated,
    isLoading
  } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [isNewSignup, setIsNewSignup] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check for redirect after successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      if (isNewSignup) {
        // Redirect new users to the Edit Profile page
        console.log("Auth: New user authenticated, redirecting to edit-profile");
        navigate('/edit-profile', {
          replace: true
        });
        setIsNewSignup(false);
      } else {
        // Redirect returning users to the page they tried to visit or home page
        const from = location.state?.from?.pathname || '/';
        console.log("Auth: Returning user authenticated, redirecting to:", from);
        navigate(from, {
          replace: true
        });
      }
    }
  }, [isAuthenticated, isNewSignup, location.state, navigate]);

  // Debug log for authentication state
  useEffect(() => {
    console.log("Auth page state:", {
      isAuthenticated,
      isLoading
    });
  }, [isAuthenticated, isLoading]);
  return <div className="min-h-screen pt-20 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-vice-purple">Vice</span> Kink
          </h1>
          <p className="text-foreground/70">Life is short. Let's get Kinky.</p>
        </div>
        
        <div className="bg-card shadow-lg rounded-xl p-6 border border-border">
          <Tabs value={activeTab} onValueChange={value => setActiveTab(value as 'login' | 'signup')} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm 
                onLogin={login} 
                isLoading={isLoading} 
                switchToSignup={() => setActiveTab('signup')} 
              />
            </TabsContent>
            
            <TabsContent value="signup">
              <SignupForm 
                onSignup={signup}
                isLoading={isLoading} 
                setIsNewSignup={setIsNewSignup} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>;
};

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
  switchToSignup: () => void;
}

const LoginForm = ({
  onLogin,
  isLoading,
  switchToSignup
}: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localLoading, setLocalLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({});
    setAuthError(null);

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    try {
      setLocalLoading(true);
      await onLogin(email, password);
      // Login is handled in the auth context
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Handle specific authentication errors with user-friendly messages
      const errorMessage = error?.message || 'An error occurred during login';
      
      if (errorMessage.includes('Invalid login credentials') || 
          errorMessage.includes('Email not confirmed') ||
          errorMessage.includes('Invalid email or password')) {
        setAuthError('Invalid email or password. Please check your credentials or sign up if you don\'t have an account.');
      } else {
        setAuthError(errorMessage);
      }
    } finally {
      setLocalLoading(false);
    }
  };

  // Use both the global and local loading states
  const buttonLoading = isLoading || localLoading;
  
  return (
    <div className="space-y-4">
      {authError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">{authError}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="your.email@example.com" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className={cn(errors.email && "border-destructive")} 
            disabled={buttonLoading} 
          />
          {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className={cn(errors.password && "border-destructive")} 
            disabled={buttonLoading} 
          />
          {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-vice-purple hover:bg-vice-dark-purple" 
          disabled={buttonLoading}
        >
          {buttonLoading ? 'Logging in...' : 'Login'}
        </Button>

        {authError && (
          <div className="text-center mt-2">
            <span className="text-sm text-muted-foreground">Don't have an account? </span>
            <button 
              type="button" 
              onClick={switchToSignup} 
              className="text-sm text-vice-purple hover:underline"
            >
              Sign up
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

interface SignupFormProps {
  onSignup: (email: string, password: string, name: string, username: string) => Promise<void>;
  isLoading: boolean;
  setIsNewSignup: (value: boolean) => void;
}

const SignupForm = ({
  onSignup,
  isLoading,
  setIsNewSignup
}: SignupFormProps) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localLoading, setLocalLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({});
    setAuthError(null);

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!name) newErrors.name = 'Name is required';
    if (!username) newErrors.username = 'Username is required';else if (username.includes(' ')) newErrors.username = 'Username cannot contain spaces';
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    try {
      setLocalLoading(true);
      // Set the new signup flag before calling the signup function
      setIsNewSignup(true);
      await onSignup(email, password, name, username);
      toast.success('Please check your email to confirm your account.');
    } catch (error: any) {
      // Handle specific signup errors
      console.error("Signup error:", error);
      const errorMessage = error?.message || 'An error occurred during signup';
      
      if (errorMessage.includes('User already registered')) {
        setAuthError('This email is already registered. Please login instead.');
      } else {
        setAuthError(errorMessage);
      }
      
      setIsNewSignup(false); // Reset if there's an error
    } finally {
      setLocalLoading(false);
    }
  };

  // Use both the global and local loading states
  const buttonLoading = isLoading || localLoading;
  
  return (
    <div className="space-y-4">
      {authError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">{authError}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">      
        <div className="space-y-1">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} className={cn(errors.name && "border-destructive")} disabled={buttonLoading} />
          {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="username">Username</Label>
          <Input id="username" type="text" placeholder="johndoe" value={username} onChange={e => setUsername(e.target.value)} className={cn(errors.username && "border-destructive")} disabled={buttonLoading} />
          {errors.username && <p className="text-destructive text-sm">{errors.username}</p>}
          <p className="text-xs text-muted-foreground">Username cannot be changed later</p>
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="signup-email">Email</Label>
          <Input id="signup-email" type="email" placeholder="your.email@example.com" value={email} onChange={e => setEmail(e.target.value)} className={cn(errors.email && "border-destructive")} />
          {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="signup-password">Password</Label>
          <Input id="signup-password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className={cn(errors.password && "border-destructive")} />
          {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input id="confirm-password" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={cn(errors.confirmPassword && "border-destructive")} />
          {errors.confirmPassword && <p className="text-destructive text-sm">{errors.confirmPassword}</p>}
        </div>
        
        <Button type="submit" className="w-full bg-vice-purple hover:bg-vice-dark-purple" disabled={buttonLoading}>
          {buttonLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
    </div>
  );
};

export default Auth;
