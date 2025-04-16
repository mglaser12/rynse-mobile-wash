
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";
import { loadUserProfile } from "../userProfile";
import { saveUserProfileToStorage } from "../storage";
import { isRunningAsPWA } from "@/registerServiceWorker";

export const useAuthSubscription = (
  setUser: (user: User | null) => void,
  setIsAuthenticated: (isAuthenticated: boolean) => void,
  setIsLoading: (isLoading: boolean) => void,
  getSession: () => Promise<void>
) => {
  // Use ref to track if the subscription has been initialized
  const subscriptionInitialized = useRef(false);

  useEffect(() => {
    // Only initialize subscription once
    if (subscriptionInitialized.current) {
      return () => {};
    }
    
    console.log("Auth subscription initialized");
    subscriptionInitialized.current = true;
    
    const detectBrokenState = () => {
      const loadingTimeout = setTimeout(() => {
        setIsLoading(false);
      }, 10000);
      
      return loadingTimeout;
    };
    
    const loadingTimeout = detectBrokenState();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      
      if (session) {
        setTimeout(async () => {
          try {
            const profile = await loadUserProfile(session.user.id);
            const updatedUser = {
              id: session.user.id,
              email: session.user.email,
              name: profile?.name || session.user.email?.split('@')[0],
              role: profile?.role || 'customer',
              organizationId: profile?.organizationId,
              avatarUrl: profile?.avatarUrl
            };
            
            setUser(updatedUser);
            setIsAuthenticated(true);
            
            saveUserProfileToStorage(updatedUser);
          } catch (error) {
            console.error("Error in auth state change handler:", error);
            const fallbackUser = {
              id: session.user.id,
              email: session.user.email,
              name: session.user.email?.split('@')[0],
              role: 'customer'
            };
            
            setUser(fallbackUser);
            setIsAuthenticated(true);
            
            saveUserProfileToStorage(fallbackUser);
          } finally {
            setIsLoading(false);
          }
        }, 0);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        saveUserProfileToStorage(null);
        setIsLoading(false);
      }
    });

    // Only call getSession once during initialization
    getSession();

    return () => {
      subscription.unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, [getSession, setIsAuthenticated, setIsLoading, setUser]);

  // Handle app visibility changes for PWA
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRunningAsPWA()) {
        console.log('App returned to foreground, refreshing session');
        getSession();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [getSession]);
};
