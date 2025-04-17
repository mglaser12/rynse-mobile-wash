
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";
import { loadUserProfile } from "../userProfile";
import { saveUserProfileToStorage } from "../storage";
import { useNavigate } from "react-router-dom";

export const useAuthMethods = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = async (email: string, password: string): Promise<User | null> => {
    setIsLoading(true);
    setLastError(null);
    try {
      console.log("Attempting to sign in with email:", email);
      
      // Clear any previous auth errors or sessions first
      await supabase.auth.signOut({ scope: 'local' });
      
      // Add a small delay to allow signOut to complete
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error("Login error:", error.message);
        const errorMessage = error.message === "Email not confirmed" 
          ? "Your email has not been verified. Please check your inbox." 
          : error.message;
        setLastError(errorMessage);
        throw error;
      }

      if (!data?.user) {
        const noUserError = "Authentication failed: No user returned";
        console.error("Login failed: No user returned from signInWithPassword");
        setLastError(noUserError);
        throw new Error(noUserError);
      }

      console.log("Login successful, fetching profile for user:", data.user.id);
      // Store session directly to ensure it's available immediately
      localStorage.setItem('supabase.auth.token', JSON.stringify(data.session));
      
      try {
        const profile = await loadUserProfile(data.user.id);
        const user: User = {
          id: data.user.id,
          email: data.user.email,
          name: profile?.name || data.user.email?.split('@')[0],
          role: profile?.role || 'customer',
          organizationId: profile?.organizationId,
          avatarUrl: profile?.avatarUrl
        };
        
        saveUserProfileToStorage(user);
        toast.success("Logged in successfully!");
        
        // Force a session refresh here
        await refreshSession();
        
        return user;
      } catch (profileError: any) {
        console.error("Error loading profile after login:", profileError);
        const fallbackUser: User = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.email?.split('@')[0],
          role: 'customer'
        };
        
        toast.warning("Logged in but couldn't load full profile");
        saveUserProfileToStorage(fallbackUser);
        
        // Force a session refresh here
        await refreshSession();
        
        return fallbackUser;
      }
    } catch (error: any) {
      console.error("Login failed:", error.message);
      const errorMsg = error.message || "Invalid credentials";
      setLastError(errorMsg);
      toast.error(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async (): Promise<void> => {
    try {
      console.log("Manually refreshing session state...");
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Session refresh error:", error.message);
      } else if (data.session) {
        console.log("Session refreshed successfully");
      } else {
        console.log("No session found during refresh");
      }
    } catch (error) {
      console.error("Error during session refresh:", error);
    }
  };

  const register = async (email: string, password: string, name: string, role: string): Promise<void> => {
    setIsLoading(true);
    setLastError(null);
    try {
      console.log("Registering with role:", role);
      
      // Always use 'customer' in the database for fleet_manager and make sure auth metadata is consistent
      const databaseRole = role === 'fleet_manager' ? 'customer' : role;
      console.log("Using database role:", databaseRole);
      
      if (!['fleet_manager', 'technician', 'admin', 'customer'].includes(role)) {
        console.warn(`Role '${role}' may not be valid in database, defaulting to 'customer'`);
      }
      
      // Set specific organization ID as a string to avoid any type issues
      const organizationId = "7e73b8a3-eb87-4b9f-8534-d85d8dcae642";
      console.log("Using organization ID:", organizationId);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            name: name,
            // Use the same role in auth metadata as we'll store in the database
            role: databaseRole,
            organization_id: organizationId
          },
        },
      });

      if (authError) {
        setLastError(authError.message);
        throw authError;
      }

      if (!authData.user) {
        const noUserError = "Failed to create user account";
        setLastError(noUserError);
        throw new Error(noUserError);
      }
      
      toast.success("Registration successful! Please login to continue.");
      navigate("/auth");
    } catch (error: any) {
      console.error("Registration failed:", error.message);
      const errorMsg = error.message || "Registration failed";
      setLastError(errorMsg);
      toast.error("Registration failed: " + errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    setLastError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setLastError(error.message);
        throw error;
      }
      
      saveUserProfileToStorage(null);
      navigate("/auth");
      toast.success("Logged out successfully!");
    } catch (error: any) {
      console.error("Logout failed:", error.message);
      const errorMsg = error.message || "Logout failed";
      setLastError(errorMsg);
      toast.error(errorMsg);
      // Force clear storage even on error
      saveUserProfileToStorage(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    lastError,
    login,
    register,
    logout,
    refreshSession,
  };
};
