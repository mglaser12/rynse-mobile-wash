
import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";
import { loadUserProfile } from "../userProfile";
import { saveUserProfileToStorage, getUserProfileFromStorage } from "../storage";
import { isRunningAsPWA } from "@/registerServiceWorker";
import { AuthChangeEvent } from "@supabase/supabase-js";

export const useSession = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(() => {
    const cachedProfile = getUserProfileFromStorage();
    return isRunningAsPWA() && cachedProfile ? cachedProfile : null;
  });
  
  const sessionCheckInProgress = useRef(false);
  const lastKnownUserId = useRef<string | null>(null);
  const initialCheckDone = useRef(false);

  const updateUserState = async (userId: string, email: string | undefined) => {
    try {
      console.log("Updating user state for:", userId);
      
      // If we already have this user's state and they're authenticated, skip the update
      if (lastKnownUserId.current === userId && user?.id === userId && isAuthenticated) {
        console.log("User state already up to date");
        setIsLoading(false);
        return;
      }

      const profile = await loadUserProfile(userId);
      const updatedUser: User = {
        id: userId,
        email: email || '',
        name: profile?.name || email?.split('@')[0] || '',
        role: profile?.role || 'customer',
        organizationId: profile?.organizationId,
        avatarUrl: profile?.avatarUrl
      };

      setUser(updatedUser);
      setIsAuthenticated(true);
      saveUserProfileToStorage(updatedUser);
      lastKnownUserId.current = userId;
      console.log("User state updated successfully:", updatedUser);
    } catch (error) {
      console.error("Error updating user state:", error);
      const fallbackUser: User = {
        id: userId,
        email: email || '',
        name: email?.split('@')[0] || '',
        role: 'customer'
      };
      setUser(fallbackUser);
      setIsAuthenticated(true);
      saveUserProfileToStorage(fallbackUser);
      lastKnownUserId.current = userId;
    } finally {
      setIsLoading(false);
      initialCheckDone.current = true;
    }
  };

  const clearUserState = useCallback(() => {
    console.log("Clearing user state");
    setUser(null);
    setIsAuthenticated(false);
    saveUserProfileToStorage(null);
    lastKnownUserId.current = null;
    setIsLoading(false);
    initialCheckDone.current = true;
  }, []);

  const getSession = useCallback(async () => {
    if (sessionCheckInProgress.current) {
      console.log("Session check already in progress, skipping");
      return;
    }

    sessionCheckInProgress.current = true;
    console.log("Fetching session from Supabase");

    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
        clearUserState();
        return;
      }

      if (session?.user) {
        await updateUserState(session.user.id, session.user.email || undefined);
      } else {
        console.log("No session found");
        clearUserState();
      }
    } catch (error) {
      console.error("Session check failed:", error);
      clearUserState();
    } finally {
      sessionCheckInProgress.current = false;
    }
  }, [clearUserState]);

  // Set up auth state listener
  useEffect(() => {
    let mounted = true;
    console.log("Setting up auth subscription");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        if (!mounted) return;
        
        console.log("Auth state changed:", event, session?.user?.id);
        
        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              setIsLoading(true);
              await updateUserState(session.user.id, session.user.email || undefined);
            }
            break;
            
          case 'SIGNED_OUT':
          case 'USER_DELETED':
            clearUserState();
            break;
            
          case 'TOKEN_REFRESHED':
            if (session?.user && (!user || user.id !== session.user.id)) {
              setIsLoading(true);
              await updateUserState(session.user.id, session.user.email || undefined);
            }
            break;
            
          case 'INITIAL_SESSION':
            if (!initialCheckDone.current) {
              if (session?.user) {
                setIsLoading(true);
                await updateUserState(session.user.id, session.user.email || undefined);
              } else {
                clearUserState();
              }
            }
            break;
        }
      }
    );

    // Initial session check
    if (!initialCheckDone.current) {
      getSession();
    }

    return () => {
      mounted = false;
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [getSession, clearUserState, user]);

  return {
    isAuthenticated,
    isLoading,
    user,
    setUser,
    setIsAuthenticated,
    getSession
  };
};
