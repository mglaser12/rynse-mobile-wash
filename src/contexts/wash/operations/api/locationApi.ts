
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Since we're now using the locations table directly with wash_requests,
 * this function is simplified to just return the provided location ID
 * after validating that it exists in the locations table
 */
export const syncLocationToWashLocations = async (locationId: string): Promise<string | null> => {
  try {
    // Check if the location exists in the locations table
    const { data: locationData, error: locationError } = await supabase
      .from('locations')
      .select('*')
      .eq('id', locationId)
      .single();
    
    if (locationError || !locationData) {
      console.error("Location not found in locations table:", locationError);
      toast.error("Location not found");
      return null;
    }
    
    console.log("Found location in locations table:", locationData);
    
    // Just return the location ID since we're now using the locations table directly
    return locationId;
  } catch (error) {
    console.error("Error in location validation:", error);
    toast.error("Failed to process location data");
    return null;
  }
};

/**
 * Get a location ID for the wash request
 * @returns The ID of the first available location
 */
export const getLocationId = async (): Promise<string | null> => {
  try {
    // Get the first available location from the locations table
    const { data: locationData, error: locationError } = await supabase
      .from('locations')
      .select('id')
      .limit(1)
      .single();
      
    if (locationError) {
      console.error("No location found:", locationError);
      toast.error("Failed to create wash request - no location available");
      return null;
    }
    
    return locationData.id;
  } catch (error) {
    console.error("Error getting location ID:", error);
    return null;
  }
};
