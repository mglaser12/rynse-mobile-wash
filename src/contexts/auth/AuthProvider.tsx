import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { isRunningAsPWA, recoverFromBrokenState } from "@/registerServiceWorker";
import { User, AuthContextType } from "./types";
import AuthContext from "./useAuth";
import { saveUserProfileToStorage, getUserProfileFromStorage } from "./storage";
import { loadUserProfile } from "./userProfile";
import { getDefaultOrganization } from "./useOrganization";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        const profile = await loadUserProfile(data.user.id);
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: profile?.name || data.user.email?.split('@')[0],
          role: profile?.role || 'customer',
          organizationId: profile?.organizationId,
          avatarUrl: profile?.avatarUrl
        });
        setIsAuthenticated(true);
        navigate("/");
        toast.success("Logged in successfully!");
        
        saveUserProfileToStorage({
          id: data.user.id,
          email: data.user.email,
          name: profile?.name || data.user.email?.split('@')[0],
          role: profile?.role || 'customer',
          organizationId: profile?.organizationId,
          avatarUrl: profile?.avatarUrl
        });
      }
    } catch (error: any) {
      console.error("Login failed:", error.message);
      toast.error("Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: string) => {
    setIsLoading(true);
    try {
      console.log("Registering with role:", role);
      
      let databaseRole = role === 'fleet_manager' ? 'customer' : role;
      console.log("Using database role:", databaseRole);
      
      if (!['fleet_manager', 'technician', 'admin', 'customer'].includes(role)) {
        console.warn(`Role '${role}' may not be valid in database, defaulting to 'customer'`);
        databaseRole = 'customer';
      }
      
      const defaultOrgId = await getDefaultOrganization();
      console.log("Default organization ID:", defaultOrgId);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            name: name,
            role: role,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          name,
          role: databaseRole,
          organization_id: defaultOrgId
        });

      if (profileError) {
        console.error("Error creating profile:", profileError.message);
        toast.warning("Account created but profile setup incomplete. Please login to continue.");
      } else {
        toast.success("Registration successful! Please login to continue.");
      }
      
      navigate("/auth");
    } catch (error: any) {
      console.error("Registration failed:", error.message);
      toast.error("Registration failed: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      setIsAuthenticated(false);
      
      saveUserProfileToStorage(null);
      
      navigate("/auth");
      toast.success("Logged out successfully!");
    } catch (error: any) {
      console.error("Logout failed:", error.message);
      toast.error("Logout failed");
      
      setUser(null);
      setIsAuthenticated(false);
      saveUserProfileToStorage(null);
    } finally {
      setIsLoading(false);
    }
  };

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
    console.log("Auth provider initialized");
    
    const detectBrokenState = () => {
      const loadingTimeout = setTimeout(() => {
        if (isLoading) {
          console.warn("App appears to be in a broken state, attempting recovery");
          
          const cachedProfile = getUserProfileFromStorage();
          if (cachedProfile) {
            setUser(cachedProfile);
            setIsAuthenticated(true);
          }
          
          setIsLoading(false);
        }
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

    getSession();

    return () => {
      subscription.unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, [getSession, isLoading]);

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

  useEffect(() => {
    console.log("Auth state:", { isAuthenticated, isLoading, user, path: location.pathname });
  }, [isAuthenticated, isLoading, user, location]);

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
