
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";
import { loadUserProfile } from "../userProfile";
import { saveUserProfileToStorage, getUserProfileFromStorage } from "../storage";
import { isRunningAsPWA } from "@/registerServiceWorker";

export const useSession = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(() => {
    // Initialize with cached profile if available
    const cachedProfile = getUserProfileFromStorage();
    return isRunningAsPWA() && cachedProfile ? cachedProfile : null;
  });

  const getSession = useCallback(async () => {
    try {
      console.log("Fetching session from Supabase");
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
        throw error;
      }

      if (session?.user) {
        try {
          const profile = await loadUserProfile(session.user.id);
          const updatedUser: User = {
            id: session.user.id,
            email: session.user.email!,
            name: profile?.name || session.user.email?.split('@')[0] || '',
            role: profile?.role || 'customer',
            organizationId: profile?.organizationId,
            avatarUrl: profile?.avatarUrl
          };

          setUser(updatedUser);
          setIsAuthenticated(true);
          saveUserProfileToStorage(updatedUser);
          console.log("Session loaded successfully:", updatedUser);
        } catch (profileError) {
          console.error("Error loading profile:", profileError);
          const fallbackUser: User = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.email?.split('@')[0] || '',
            role: 'customer'
          };
          setUser(fallbackUser);
          setIsAuthenticated(true);
          saveUserProfileToStorage(fallbackUser);
        }
      } else {
        console.log("No session found");
        setUser(null);
        setIsAuthenticated(false);
        saveUserProfileToStorage(null);
      }
    } catch (error) {
      console.error("Session check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
      saveUserProfileToStorage(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set up auth state listener
  useEffect(() => {
    getSession(); // Initial session check

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setIsLoading(true);
          try {
            const profile = await loadUserProfile(session.user.id);
            const updatedUser: User = {
              id: session.user.id,
              email: session.user.email!,
              name: profile?.name || session.user.email?.split('@')[0] || '',
              role: profile?.role || 'customer',
              organizationId: profile?.organizationId,
              avatarUrl: profile?.avatarUrl
            };
            setUser(updatedUser);
            setIsAuthenticated(true);
            saveUserProfileToStorage(updatedUser);
          } catch (error) {
            console.error("Error updating user after auth state change:", error);
          } finally {
            setIsLoading(false);
          }
        } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          setUser(null);
          setIsAuthenticated(false);
          saveUserProfileToStorage(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [getSession]);

  return {
    isAuthenticated,
    isLoading,
    user,
    setUser,
    setIsAuthenticated,
    getSession
  };
};