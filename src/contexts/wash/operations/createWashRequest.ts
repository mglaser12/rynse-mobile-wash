
import { supabase } from "@/integrations/supabase/client";
import { CreateWashRequestData } from "../types";
import { WashRequest, WashStatus } from "@/models/types";
import { toast } from "sonner";
import { getFullWashRequest } from "./api/washRequestDetails";
import { syncLocationToWashLocations } from "./api/locationApi";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabaseApi";
import { insertWashRequestStandard, insertWashRequestDirect } from "./api/washRequestApiClient";

/**
 * Create a new wash request in the database
 */
export async function createWashRequest(data: CreateWashRequestData): Promise<WashRequest | null> {
  try {
    console.log("Creating wash request with data:", data);

    // Check if we need to sync locations between tables
    let locationId = data.locationId;
    if (locationId) {
      locationId = await syncLocationToWashLocations(locationId);
      
      if (!locationId) {
        console.error("Failed to sync location");
        toast.error("Failed to create wash request - location error");
        return null;
      }
    }

    // Create the wash request data object - make sure to include location_id
    const washRequestData = {
      user_id: data.customerId,
      preferred_date_start: data.preferredDates.start.toISOString(),
      preferred_date_end: data.preferredDates.end ? data.preferredDates.end.toISOString() : null,
      status: 'pending' as WashStatus,
      price: data.price,
      notes: data.notes || null,
      location_detail_id: locationId || null,
      location_id: locationId || null // Added this field to fix the TypeScript error
    };

    console.log("Inserting wash request with:", washRequestData);

    try {
      // First attempt: Use the standard Supabase client
      const result = await insertWashRequestStandard(washRequestData);
      
      if (result) {
        console.log("Standard insert successful:", result);
        
        // Insert vehicle associations
        if (data.vehicles && data.vehicles.length > 0) {
          await createVehicleAssociations(result.id, data.vehicles);
        }
        
        // Get the full wash request with all associations
        return await getFullWashRequest(result.id);
      }
      
      // Second attempt: Use direct API call
      console.log("Standard insert failed, trying direct API method");
      // Get the current session token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      
      const directResult = await insertWashRequestDirect(washRequestData, accessToken);
      
      if (directResult) {
        console.log("Direct API insert successful:", directResult);
        
        // Insert vehicle associations
        if (data.vehicles && data.vehicles.length > 0) {
          await createVehicleAssociations(directResult.id, data.vehicles);
        }
        
        // Get the full wash request with all associations
        return await getFullWashRequest(directResult.id);
      }
      
      // If both methods failed, try without a location ID
      console.log("All insert methods failed, trying without location");
      
      // Last resort: Try inserting without a location ID
      const fallbackData = { 
        ...washRequestData,
        location_id: null,
        location_detail_id: null
      };
      
      const { data: fallbackResult, error: fallbackError } = await supabase
        .from('wash_requests')
        .insert(fallbackData)
        .select('*')
        .single();
        
      if (fallbackError) {
        console.error("All insert methods failed:", fallbackError);
        toast.error("Failed to create wash request");
        return null;
      }
      
      console.log("Fallback insert successful:", fallbackResult);
      
      // Insert vehicle associations
      if (data.vehicles && data.vehicles.length > 0) {
        await createVehicleAssociations(fallbackResult.id, data.vehicles);
      }
      
      // Get the full wash request with all associations
      return await getFullWashRequest(fallbackResult.id);
      
    } catch (insertError) {
      console.error("Error in insert process:", insertError);
      toast.error("Failed to create wash request");
      return null;
    }
  } catch (error) {
    console.error("Error creating wash request:", error);
    toast.error("Failed to create wash request");
    return null;
  }
}

/**
 * Helper function to associate vehicles with a wash request
 */
export async function createVehicleAssociations(washRequestId: string, vehicleIds: string[]): Promise<boolean> {
  try {
    const vehicleAssociations = vehicleIds.map(vehicleId => ({
      wash_request_id: washRequestId,
      vehicle_id: vehicleId
    }));

    const { error } = await supabase
      .from('wash_request_vehicles')
      .insert(vehicleAssociations);

    if (error) {
      console.error("Error associating vehicles:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error creating vehicle associations:", error);
    return false;
  }
}
