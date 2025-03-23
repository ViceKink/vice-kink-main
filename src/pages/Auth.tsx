
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const Auth = () => {
  const { login, signup, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();
  
  // Add effect to handle navigation when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      console.log("User is authenticated, navigating to home");
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  console.log("Auth page state:", { isAuthenticated, authLoading });
  
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
              <LoginForm onLogin={login} isAuthLoading={authLoading} />
            </TabsContent>
            
            <TabsContent value="signup">
              <SignupForm onSignup={signup} isAuthLoading={authLoading} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  isAuthLoading: boolean;
}

const LoginForm = ({ onLogin, isAuthLoading }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  
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
      setIsLocalLoading(true);
      await onLogin(email, password);
    } catch (error) {
      // Error is handled in the auth context
      console.error("Login form error:", error);
    } finally {
      setIsLocalLoading(false);
    }
  };
  
  // Combined loading state from local and auth context
  const loading = isLocalLoading || isAuthLoading;
  
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
          disabled={loading}
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
          disabled={loading}
        />
        {errors.password && (
          <p className="text-destructive text-sm">{errors.password}</p>
        )}
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-vice-purple hover:bg-vice-dark-purple" 
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
};

interface SignupFormProps {
  onSignup: (userData: any, password: string) => Promise<void>;
  isAuthLoading: boolean;
}

const SignupForm = ({ onSignup, isAuthLoading }: SignupFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  
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
      setIsLocalLoading(true);
      const userData = {
        name,
        email
      };
      
      await onSignup(userData, password);
      toast.success('Please check your email to confirm your account.');
    } catch (error) {
      // Error is handled in the auth context
      console.error("Signup form error:", error);
    } finally {
      setIsLocalLoading(false);
    }
  };
  
  // Combined loading state from local and auth context
  const loading = isLocalLoading || isAuthLoading;
  
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
          disabled={loading}
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
          disabled={loading}
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
          disabled={loading}
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
          disabled={loading}
        />
        {errors.confirmPassword && (
          <p className="text-destructive text-sm">{errors.confirmPassword}</p>
        )}
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-vice-purple hover:bg-vice-dark-purple" 
        disabled={loading}
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
};

export default Auth;
