
import { supabase } from "@/integrations/supabase/client";
import { getDefaultOrganization } from "@/contexts/auth/useOrganization";

/**
 * Get the organization ID for a user
 * @param userId User ID
 * @returns Organization ID if found, null otherwise
 */
export async function getUserOrganizationId(userId: string): Promise<string | null> {
  try {
    console.log("Getting organization ID for user:", userId);
    
    // Try to get the organization ID from the user's profile
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .single();
      
    if (userError) {
      console.error("Error fetching user profile:", userError);
      // If there's an error, try to get the default organization
      return getDefaultOrganization();
    }
    
    // If the user has an organization ID, return it
    if (userData?.organization_id) {
      console.log("User organization ID found:", userData.organization_id);
      return userData.organization_id;
    }
    
    // If the user doesn't have an organization ID, try to get the default organization
    console.log("User has no organization ID, getting default organization");
    return getDefaultOrganization();
  } catch (error) {
    console.error("Error in getUserOrganizationId:", error);
    return null;
  }
}
