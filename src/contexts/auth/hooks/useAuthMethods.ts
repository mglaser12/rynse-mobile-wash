
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";
import { loadUserProfile } from "../userProfile";
import { saveUserProfileToStorage } from "../storage";
import { getDefaultOrganization } from "../useOrganization";

export const useAuthMethods = () => {
  const [isLoading, setIsLoading] = useState(false);
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
        const user: User = {
          id: data.user.id,
          email: data.user.email,
          name: profile?.name || data.user.email?.split('@')[0],
          role: profile?.role || 'customer',
          organizationId: profile?.organizationId,
          avatarUrl: profile?.avatarUrl
        };
        
        saveUserProfileToStorage(user);
        navigate("/");
        toast.success("Logged in successfully!");
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
      
      let databaseRole = role === 'fleet_manager' ? 'customer' : role;
      console.log("Using database role:", databaseRole);
      
      if (!['fleet_manager', 'technician', 'admin', 'customer'].includes(role)) {
        console.warn(`Role '${role}' may not be valid in database, defaulting to 'customer'`);
        databaseRole = 'customer';
      }
      
      // Set specific organization ID
      const organizationId = "7e73b8a3-eb87-4b9f-8534-d85d8dcae642";
      console.log("Using organization ID:", organizationId);
      
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
          organization_id: organizationId
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
