import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
  isLoading: false,
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

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
          name: profile?.name,
          role: profile?.role,
          organizationId: profile?.organizationId,
          avatarUrl: profile?.avatarUrl
        });
        setIsAuthenticated(true);
        navigate("/");
        toast.success("Logged in successfully!");
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

      if (authData?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              email: email,
              name: name,
              role: role,
            },
          ]);

        if (profileError) {
          console.error("Error creating profile:", profileError);
          toast.error("Failed to create profile");
          return;
        }

        setUser({
          id: authData.user.id,
          email: email,
          name: name,
          role: role,
        });
        setIsAuthenticated(true);
        navigate("/");
        toast.success("Registration successful!");
      }
    } catch (error: any) {
      console.error("Registration failed:", error.message);
      toast.error("Registration failed");
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
      navigate("/auth");
      toast.success("Logged out successfully!");
    } catch (error: any) {
      console.error("Logout failed:", error.message);
      toast.error("Logout failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Modify the loadUserProfile function to include organization information
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
      return null;
    }
  };

  // Modify the getSession function to include organization information
  const getSession = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      if (data?.session) {
        const userId = data.session.user.id;
        const profile = await loadUserProfile(userId);
        
        setUser({
          id: userId,
          email: data.session.user.email,
          name: profile?.name,
          role: profile?.role,
          organizationId: profile?.organizationId,
          avatarUrl: profile?.avatarUrl
        });
        
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error getting session:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [loadUserProfile, navigate]);

  useEffect(() => {
    getSession();

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user.id).then(profile => {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: profile?.name,
            role: profile?.role,
            organizationId: profile?.organizationId,
            avatarUrl: profile?.avatarUrl
          });
          setIsAuthenticated(true);
        });
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });
  }, [getSession, loadUserProfile]);

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
