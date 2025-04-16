
import { supabase } from "@/integrations/supabase/client";
import { User } from "./types";

// Load user profile function with better error handling
export const loadUserProfile = async (userId: string): Promise<User | null> => {
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
