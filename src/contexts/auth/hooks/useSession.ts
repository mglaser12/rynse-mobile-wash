
import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";
import { loadUserProfile } from "../userProfile";
import { saveUserProfileToStorage, getUserProfileFromStorage } from "../storage";
import { isRunningAsPWA } from "@/registerServiceWorker";

export const useSession = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const sessionCheckInProgress = useRef(false);
  const sessionCheckAttempts = useRef(0);
  const MAX_SESSION_CHECK_ATTEMPTS = 3;

  const getSession = useCallback(async () => {
    // Prevent concurrent session checks
    if (sessionCheckInProgress.current) {
      console.log("Session check already in progress, skipping");
      return;
    }

    console.log("Getting session...");
    sessionCheckInProgress.current = true;
    
    // Use cached profile for initial render if available
    const cachedProfile = getUserProfileFromStorage();
    if (isRunningAsPWA() && cachedProfile) {
      console.log("Using cached profile while fetching fresh session");
      setUser(cachedProfile);
      setIsAuthenticated(true);
    }
    
    // Track attempts to prevent infinite checking
    sessionCheckAttempts.current += 1;
    
    // Create a timeout to prevent hanging on network issues
    const timeoutId = setTimeout(() => {
      console.log("Session check timed out");
      
      if (isRunningAsPWA() && cachedProfile) {
        console.log("Continuing with cached profile due to network timeout");
        setIsAuthenticated(true);
        setUser(cachedProfile);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      
      setIsLoading(false);
      sessionCheckInProgress.current = false;
    }, 5000);
    
    try {
      console.log("Fetching session from Supabase");
      const { data, error } = await supabase.auth.getSession();
      
      // Clear timeout since we got a response
      clearTimeout(timeoutId);
      
      if (error) {
        console.error("Error getting session:", error);
        
        if (isRunningAsPWA() && cachedProfile) {
          console.log("Using cached profile due to API error");
          setUser(cachedProfile);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        
        setIsLoading(false);
        sessionCheckInProgress.current = false;
        return;
      }
      
      if (data?.session) {
        console.log("Session found, loading user profile");
        const userId = data.session.user.id;
        
        try {
          const profile = await loadUserProfile(userId);
          
          const updatedUser = {
            id: userId,
            email: data.session.user.email,
            name: profile?.name || data.session.user.email?.split('@')[0],
            role: profile?.role || 'customer',
            organizationId: profile?.organizationId,
            avatarUrl: profile?.avatarUrl
          };
          
          // Update state immediately to ensure auth check works
          setUser(updatedUser);
          setIsAuthenticated(true);
          
          saveUserProfileToStorage(updatedUser);
          console.log("Session loaded successfully, authenticated as:", updatedUser.name);
        } catch (profileError) {
          console.error("Error loading profile after session:", profileError);
          
          const fallbackUser = {
            id: userId,
            email: data.session.user.email,
            name: data.session.user.email?.split('@')[0],
            role: 'customer'
          };
          
          setUser(fallbackUser);
          setIsAuthenticated(true);
          
          saveUserProfileToStorage(fallbackUser);
        }
      } else {
        console.log("No session found");
        
        saveUserProfileToStorage(null);
        
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error getting session:", error);
      
      clearTimeout(timeoutId);
      
      if (isRunningAsPWA() && cachedProfile) {
        console.log("Using cached profile due to error getting session");
        setUser(cachedProfile);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
      sessionCheckInProgress.current = false;
      console.log("Session check complete, loading set to false");
      
      // Reset attempt counter on successful completion
      sessionCheckAttempts.current = 0;
    }
  }, []);

  // Set up an initial check for existing sessions when component mounts
  useEffect(() => {
    // Force session check on initial load
    getSession();
    
    // Safety timeout to prevent infinite loading state
    const safetyTimeoutId = setTimeout(() => {
      if (isLoading) {
        console.log("Safety timeout triggered - forcing loading state to false");
        setIsLoading(false);
      }
    }, 8000); // 8 seconds max loading time
    
    return () => {
      console.log("Session hook cleanup");
      clearTimeout(safetyTimeoutId);
    };
  }, [getSession, isLoading]);

  return {
    isAuthenticated,
    isLoading,
    user,
    setUser,
    setIsAuthenticated,
    getSession
  };
};
