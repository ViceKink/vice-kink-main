
import { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth';
import { fetchUserProfile } from '@/utils/authUtils';

export function useAuthState() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const updateUserData = useCallback(async (session: Session | null) => {
    if (session?.user) {
      try {
        const userData = await fetchUserProfile(session.user.id);
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const fetchProfile = async (userId?: string): Promise<UserProfile | null> => {
    try {
      const targetId = userId || session?.user?.id;
      
      if (!targetId) {
        console.error('No user ID available to fetch profile');
        return null;
      }
      
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 8000);
      });
      
      const fetchPromise = fetchUserProfile(targetId);
      
      const userData = await Promise.race([fetchPromise, timeoutPromise]) as UserProfile;
      
      if (!userId && session?.user?.id === targetId) {
        setUser(userData);
      }
      
      return userData;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log("Setting up auth state listener");
    let authStateSubscription: { unsubscribe: () => void } | null = null;
    
    const setupAuthListener = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        console.log("Initial session check:", sessionData.session ? "Session exists" : "No session");
        setSession(sessionData.session);
        
        const { data } = supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            console.log("Auth state changed:", _event, newSession ? "Session exists" : "No session");
            setSession(newSession);
            
            if (newSession) {
              await updateUserData(newSession);
            } else {
              setUser(null);
              setLoading(false);
            }
          }
        );
        
        authStateSubscription = data.subscription;
        
        if (sessionData.session) {
          await updateUserData(sessionData.session);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error setting up auth listener:", error);
        setLoading(false);
      }
    };
    
    setupAuthListener();
    
    return () => {
      if (authStateSubscription) {
        authStateSubscription.unsubscribe();
      }
    };
  }, [updateUserData]);

  return {
    user,
    setUser,
    session,
    loading
  };
}
