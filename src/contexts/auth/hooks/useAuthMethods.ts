import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";
import { loadUserProfile } from "../userProfile";
import { saveUserProfileToStorage } from "../storage";

export const useAuthMethods = () => {
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("Attempting to sign in with email:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        console.log("Login successful, fetching profile for user:", data.user.id);
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
        // Do NOT navigate here - let the Auth component handle navigation
        // based on the auth state changes
        toast.success("Logged in successfully!");
        return user;
      }
    } catch (error: any) {
      console.error("Login failed:", error.message);
      toast.error("Invalid credentials");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: string) => {
    setIsLoading(true);
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
        throw authError;
      }

      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      // IMPORTANT: Don't insert into profiles table, the database trigger will handle this
      // The handle_new_user() function will create the profile automatically
      
      // Just show a success message
      toast.success("Registration successful! Please login to continue.");
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
      
      saveUserProfileToStorage(null);
      navigate("/auth");
      toast.success("Logged out successfully!");
    } catch (error: any) {
      console.error("Logout failed:", error.message);
      toast.error("Logout failed");
      saveUserProfileToStorage(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    login,
    register,
    logout,
  };
};
