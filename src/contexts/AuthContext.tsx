import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { isRunningAsPWA, recoverFromBrokenState } from "@/registerServiceWorker";

// Extend the User type to include organization info
export type User = {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  organizationId?: string;
  avatarUrl?: string;
};

export type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true, // Default to true so components know we're checking auth
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// Save user profile to localStorage for offline access
const saveUserProfileToStorage = (user: User | null) => {
  try {
    if (user) {
      localStorage.setItem('userProfile', JSON.stringify(user));
    } else {
      localStorage.removeItem('userProfile');
    }
  } catch (error) {
    console.error('Failed to save user profile to storage:', error);
  }
};

// Get user profile from localStorage
const getUserProfileFromStorage = (): User | null => {
  try {
    const storedProfile = localStorage.getItem('userProfile');
    return storedProfile ? JSON.parse(storedProfile) : null;
  } catch (error) {
    console.error('Failed to get user profile from storage:', error);
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
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
          name: profile?.name || data.user.email?.split('@')[0], // Fallback to email username if no name
          role: profile?.role || 'customer', // Default to customer role if none specified
          organizationId: profile?.organizationId,
          avatarUrl: profile?.avatarUrl
        });
        setIsAuthenticated(true);
        navigate("/");
        toast.success("Logged in successfully!");
        
        // Save profile to localStorage for offline access
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
          role,
        });

      if (profileError) {
        console.error("Error creating profile:", profileError);
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
      
      // Clear stored profile
      saveUserProfileToStorage(null);
      
      navigate("/auth");
      toast.success("Logged out successfully!");
    } catch (error: any) {
      console.error("Logout failed:", error.message);
      toast.error("Logout failed");
      
      // Even if logout fails, clear local state and storage
      setUser(null);
      setIsAuthenticated(false);
      saveUserProfileToStorage(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Load user profile function with better error handling
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error("Error loading user profile:", error);
        return null;
      }
      
      if (data) {
        return {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role,
          organizationId: data.organization_id,
          avatarUrl: data.avatar_url
        };
      }
      
      return null;
    } catch (error) {
      console.error("Error in loadUserProfile:", error);
      return {
        id: userId,
        name: "User", 
        role: "customer"
      };
    }
  };

  // Get session function with improved error handling and PWA considerations
  const getSession = useCallback(async () => {
    console.log("Getting session...");
    
    // Check for cached profile first for PWAs to avoid blank screens
    const cachedProfile = getUserProfileFromStorage();
    if (isRunningAsPWA() && cachedProfile) {
      console.log("Using cached profile while fetching fresh session");
      // Set cached user immediately to avoid blank screen
      setUser(cachedProfile);
      setIsAuthenticated(true);
      
      // But don't set isLoading to false yet as we still want to check with Supabase
    }
    
    // Set up a timeout to prevent indefinite loading state
    const timeoutId = setTimeout(() => {
      console.log("Session check timed out");
      
      if (isRunningAsPWA() && cachedProfile) {
        // In PWAs, if we have a cached profile, keep using it despite network timeout
        console.log("Continuing with cached profile due to network timeout");
        setIsAuthenticated(true);
        setUser(cachedProfile);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      
      setIsLoading(false);
    }, 5000); // 5-second timeout
    
    try {
      const { data, error } = await supabase.auth.getSession();
      
      // Clear timeout since we got a response
      clearTimeout(timeoutId);
      
      if (error) {
        console.error("Error getting session:", error);
        
        if (isRunningAsPWA() && cachedProfile) {
          // In PWAs, if we have a cached profile, use it despite API error
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
          
          // Update cached profile with fresh data
          saveUserProfileToStorage(updatedUser);
        } catch (profileError) {
          console.error("Error loading profile after session:", profileError);
          
          // Set minimal user data even if profile fetch fails
          const fallbackUser = {
            id: userId,
            email: data.session.user.email,
            name: data.session.user.email?.split('@')[0],
            role: 'customer'
          };
          
          setUser(fallbackUser);
          setIsAuthenticated(true);
          
          // Update cache with minimal data
          saveUserProfileToStorage(fallbackUser);
        }
      } else {
        console.log("No session found");
        
        // Clear cached profile when no session exists
        saveUserProfileToStorage(null);
        
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error getting session:", error);
      
      // Clear timeout if there's an error
      clearTimeout(timeoutId);
      
      if (isRunningAsPWA() && cachedProfile) {
        // In PWAs, if we have a cached profile, keep using it despite error
        console.log("Using cached profile due to error getting session");
        setUser(cachedProfile);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      // CRITICAL: Always set loading to false when finished, regardless of outcome
      setIsLoading(false);
      console.log("Session check complete, loading set to false");
    }
  }, []);

  // Effect for initialization and session monitoring
  useEffect(() => {
    console.log("Auth provider initialized");
    
    // Function to detect and recover from broken state
    const detectBrokenState = () => {
      // If the app has been initialized but we're still loading after 10 seconds
      // that indicates a potential broken state
      const loadingTimeout = setTimeout(() => {
        if (isLoading) {
          console.warn("App appears to be in a broken state, attempting recovery");
          
          // Try loading from cache one last time
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
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      
      if (session) {
        // Use setTimeout to avoid potential deadlock with Supabase client
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
            
            // Update cached profile
            saveUserProfileToStorage(updatedUser);
          } catch (error) {
            console.error("Error in auth state change handler:", error);
            // Set minimal user info on error
            const fallbackUser = {
              id: session.user.id,
              email: session.user.email,
              name: session.user.email?.split('@')[0],
              role: 'customer'
            };
            
            setUser(fallbackUser);
            setIsAuthenticated(true);
            
            // Cache fallback user
            saveUserProfileToStorage(fallbackUser);
          } finally {
            setIsLoading(false);
          }
        }, 0);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        // Clear cached profile
        saveUserProfileToStorage(null);
        setIsLoading(false);
      }
    });

    // Check for existing session
    getSession();

    // Cleanup subscription and timeout on unmount
    return () => {
      subscription.unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, [getSession, isLoading]);

  // Listen for app visibility changes to refresh session when app comes to foreground
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

  // Debug output to help diagnose loading issues
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
