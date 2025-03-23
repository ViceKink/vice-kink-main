
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const Auth = () => {
  const { login, signup, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check for redirect after successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to the page they tried to visit or home page
      const from = location.state?.from?.pathname || '/';
      console.log("Auth: User authenticated, redirecting to:", from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, location.state, navigate]);
  
  // Debug log for authentication state
  useEffect(() => {
    console.log("Auth page state:", { isAuthenticated, isLoading });
  }, [isAuthenticated, isLoading]);
  
  // Don't render Navigate directly, use the effect instead
  // This prevents issues with infinite redirects or loading states
  
  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-vice-purple">Vice</span> Kink
          </h1>
          <p className="text-foreground/70">Express your desires creatively</p>
        </div>
        
        <div className="bg-card shadow-lg rounded-xl p-6 border border-border">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'login' | 'signup')}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm onLogin={login} isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent value="signup">
              <SignupForm onSignup={signup} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
}

const LoginForm = ({ onLogin, isLoading }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localLoading, setLocalLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    
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
    } catch (error) {
      console.error("Login error:", error);
      // Error is handled in the auth context
    } finally {
      setLocalLoading(false);
    }
  };
  
  // Use both the global and local loading states
  const buttonLoading = isLoading || localLoading;
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={cn(errors.email && "border-destructive")}
          disabled={buttonLoading}
        />
        {errors.email && (
          <p className="text-destructive text-sm">{errors.email}</p>
        )}
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={cn(errors.password && "border-destructive")}
          disabled={buttonLoading}
        />
        {errors.password && (
          <p className="text-destructive text-sm">{errors.password}</p>
        )}
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-vice-purple hover:bg-vice-dark-purple" 
        disabled={buttonLoading}
      >
        {buttonLoading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
};

interface SignupFormProps {
  onSignup: (userData: any, password: string) => Promise<void>;
  isLoading: boolean;
}

const SignupForm = ({ onSignup, isLoading }: SignupFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    
    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!name) newErrors.name = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      const userData = {
        name,
        email
      };
      
      await onSignup(userData, password);
      toast.success('Please check your email to confirm your account.');
    } catch (error) {
      // Error is handled in the auth context
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={cn(errors.name && "border-destructive")}
        />
        {errors.name && (
          <p className="text-destructive text-sm">{errors.name}</p>
        )}
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={cn(errors.email && "border-destructive")}
        />
        {errors.email && (
          <p className="text-destructive text-sm">{errors.email}</p>
        )}
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={cn(errors.password && "border-destructive")}
        />
        {errors.password && (
          <p className="text-destructive text-sm">{errors.password}</p>
        )}
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={cn(errors.confirmPassword && "border-destructive")}
        />
        {errors.confirmPassword && (
          <p className="text-destructive text-sm">{errors.confirmPassword}</p>
        )}
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-vice-purple hover:bg-vice-dark-purple" 
        disabled={isLoading}
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
};

export default Auth;
