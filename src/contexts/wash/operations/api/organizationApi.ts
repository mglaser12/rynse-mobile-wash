
import { supabase } from "@/integrations/supabase/client";

/**
 * Get the organization ID for a user
 * @param userId The user ID
 * @param providedOrgId Optional organization ID that may already be provided
 * @returns The organization ID to use
 */
export const getUserOrganizationId = async (userId: string, providedOrgId?: string): Promise<string | undefined> => {
  // If an organization ID is already provided, use it
  if (providedOrgId) {
    return providedOrgId;
  }
  
  try {
    // Get the user's organization_id from their profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .single();
      
    return profileData?.organization_id;
  } catch (error) {
    console.error("Error getting user organization ID:", error);
    return undefined;
  }
};
