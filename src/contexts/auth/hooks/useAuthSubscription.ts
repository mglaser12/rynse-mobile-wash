
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
  const authUpdateInProgress = useRef(false);

  useEffect(() => {
    // Only initialize subscription once
    if (subscriptionInitialized.current) {
      return () => {};
    }
    
    console.log("Auth subscription initialized");
    subscriptionInitialized.current = true;
    
    // Timeout to detect if the auth system is not responding
    const detectBrokenState = () => {
      const loadingTimeout = setTimeout(() => {
        console.log("Auth state timeout - forcing loading to false");
        setIsLoading(false);
      }, 5000);
      
      return loadingTimeout;
    };
    
    const loadingTimeout = detectBrokenState();
    
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session ? "Session exists" : "No session");
      
      // Prevent concurrent auth updates
      if (authUpdateInProgress.current) {
        console.log("Auth update already in progress, will process later");
        return;
      }
      
      authUpdateInProgress.current = true;
      
      try {
        if (session) {
          try {
            console.log("Loading profile for user:", session.user.id);
            const profile = await loadUserProfile(session.user.id);
            const updatedUser = {
              id: session.user.id,
              email: session.user.email,
              name: profile?.name || session.user.email?.split('@')[0],
              role: profile?.role || 'customer',
              organizationId: profile?.organizationId,
              avatarUrl: profile?.avatarUrl
            };
            
            console.log("Setting user with role:", updatedUser.role);
            setUser(updatedUser);
            setIsAuthenticated(true);
            
            saveUserProfileToStorage(updatedUser);
            setIsLoading(false);
            clearTimeout(loadingTimeout); // Clear the timeout since we've updated the state
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
            setIsLoading(false);
            clearTimeout(loadingTimeout);
          }
        } else {
          console.log("No session in auth state change, setting user to null");
          setUser(null);
          setIsAuthenticated(false);
          saveUserProfileToStorage(null);
          setIsLoading(false);
          clearTimeout(loadingTimeout);
        }
      } finally {
        authUpdateInProgress.current = false;
      }
    });

    // Do an immediate session check in case there's a valid session already
    getSession();

    // Global safety timeout as a last resort
    const globalSafetyTimeout = setTimeout(() => {
      console.warn("Global safety timeout triggered in auth subscription");
      setIsLoading(false);
    }, 15000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(loadingTimeout);
      clearTimeout(globalSafetyTimeout);
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
