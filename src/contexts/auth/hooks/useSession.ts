
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";
import { loadUserProfile } from "../userProfile";
import { saveUserProfileToStorage, getUserProfileFromStorage } from "../storage";
import { isRunningAsPWA } from "@/registerServiceWorker";

export const useSession = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const getSession = useCallback(async () => {
    console.log("Getting session...");
    
    const cachedProfile = getUserProfileFromStorage();
    if (isRunningAsPWA() && cachedProfile) {
      console.log("Using cached profile while fetching fresh session");
      setUser(cachedProfile);
      setIsAuthenticated(true);
    }
    
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
    }, 5000);
    
    try {
      const { data, error } = await supabase.auth.getSession();
      
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
          
          setUser(updatedUser);
          setIsAuthenticated(true);
          
          saveUserProfileToStorage(updatedUser);
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
      console.log("Session check complete, loading set to false");
    }
  }, []);

  useEffect(() => {
    return () => {
      console.log("Session hook cleanup");
    };
  }, []);

  return {
    isAuthenticated,
    isLoading,
    user,
    setUser,
    setIsAuthenticated,
    getSession
  };
};
