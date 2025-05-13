import { supabase } from "@/integrations/supabase/client";
import { CreateWashRequestData } from "../types";
import { WashRequest, WashStatus } from "@/models/types";
import { toast } from "sonner";
import { getFullWashRequest } from "./api/washRequestDetails";
import { createVehicleAssociations } from "./api/vehicleApi";
import { insertWashRequestStandard, insertWashRequestDirect } from "./api/washRequestApiClient";
import { getUserOrganizationId } from "./api/organizationApi";

/**
 * Create a new wash request in the database
 */
export async function createWashRequest(data: CreateWashRequestData): Promise<WashRequest | null> {
  try {
    console.log("Creating wash request with data:", data);

    // Get the user's organization_id
    const organizationId = await getUserOrganizationId(data.customerId);
    console.log("User organization ID for wash request:", organizationId);

    // Create the wash request data object
    const washRequestData = {
      user_id: data.customerId,
      preferred_date_start: data.preferredDates.start.toISOString(),
      preferred_date_end: data.preferredDates.end ? data.preferredDates.end.toISOString() : null,
      status: 'pending' as WashStatus,
      price: data.price,
      notes: data.notes || null,
      location_id: data.locationId || null,
      location_detail_id: data.locationId || null,
      organization_id: organizationId, // Add organization_id to wash request data
      recurring_frequency: data.recurringFrequency || null,
      recurring_count: data.recurringCount || null
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
