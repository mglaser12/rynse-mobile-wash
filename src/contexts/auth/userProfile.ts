
import { supabase } from "@/integrations/supabase/client";
import { User } from "./types";

// Load user profile function with better error handling and automatic retry
export const loadUserProfile = async (userId: string): Promise<User | null> => {
  let retries = 2;
  
  while (retries >= 0) {
    try {
      // Use maybeSingle instead of single to avoid errors when no profile is found
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        console.error("Error loading user profile:", error);
        if (retries > 0) {
          console.log(`Retrying profile load for user ${userId}, attempts left: ${retries}`);
          retries--;
          // Add a small delay before retrying
          await new Promise(resolve => setTimeout(resolve, 500));
          continue;
        }
        return null;
      }
      
      if (data) {
        return {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role || 'customer',
          organizationId: data.organization_id,
          avatarUrl: data.avatar_url
        };
      } else {
        console.log(`No profile found for user ${userId}, creating fallback profile`);
        // Return minimal data if profile not found
        return {
          id: userId,
          name: "User", 
          role: "customer"
        };
      }
    } catch (error) {
      console.error("Error in loadUserProfile:", error);
      if (retries > 0) {
        retries--;
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }
      // Last resort fallback
      return {
        id: userId,
        name: "User", 
        role: "customer"
      };
    }
  }
  
  // This should only happen if all retries failed
  return {
    id: userId,
    name: "User",
    role: "customer"
  };
};
