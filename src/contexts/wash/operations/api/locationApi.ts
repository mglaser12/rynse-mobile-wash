
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Get a location ID for the wash request
 * @returns The ID of the first available location or a newly created default location
 */
export const getLocationId = async (): Promise<string | null> => {
  try {
    // Try to get the first available location
    const { data: locationData, error: locationError } = await supabase
      .from('wash_locations')
      .select('id')
      .limit(1)
      .single();
      
    if (!locationError) {
      return locationData.id;
    }
    
    console.log("No location found, creating default location");
    // If we can't find a location, create a default one
    const { data: newLocation, error: createLocationError } = await supabase
      .from('wash_locations')
      .insert({
        name: "Default Location",
        address: "123 Main St",
        city: "Default City",
        state: "CA",
        zip_code: "00000"
      })
      .select('id')
      .single();
      
    if (createLocationError) {
      console.error("Error creating default location:", createLocationError);
      toast.error("Failed to create wash request - location error");
      return null;
    }
    
    return newLocation.id;
  } catch (error) {
    console.error("Error getting location ID:", error);
    return null;
  }
};
