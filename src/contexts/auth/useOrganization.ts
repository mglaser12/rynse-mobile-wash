
import { supabase } from "@/integrations/supabase/client";

// Get default organization
export const getDefaultOrganization = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)
      .single();
      
    if (error) {
      console.error("Error fetching default organization:", error);
      return null;
    }
    
    return data?.id || null;
  } catch (error) {
    console.error("Error in getDefaultOrganization:", error);
    return null;
  }
};
