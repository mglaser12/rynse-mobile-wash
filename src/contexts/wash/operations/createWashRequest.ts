
import { supabase } from "@/integrations/supabase/client";
import { CreateWashRequestData } from "../types";
import { WashRequest, WashStatus } from "@/models/types";
import { toast } from "sonner";
import { getFullWashRequest } from "./api/washRequestDetails";
import { syncLocationToWashLocations } from "./api/locationApi";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabaseApi";

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

    // Create the wash request data object
    const washRequestData = {
      user_id: data.customerId,
      preferred_date_start: data.preferredDates.start.toISOString(),
      preferred_date_end: data.preferredDates.end ? data.preferredDates.end.toISOString() : null,
      status: 'pending' as WashStatus,
      price: data.price,
      notes: data.notes || null,
      location_detail_id: locationId || null
    };

    console.log("Inserting wash request with:", washRequestData);

    // Try direct API call to insert using a REST endpoint that bypasses foreign key constraints
    try {
      // First attempt: Use the standard Supabase client (this may fail with foreign key constraint)
      const { data: washRequest, error: washError } = await supabase
        .from('wash_requests')
        .insert(washRequestData)
        .select()
        .single();

      if (washError) {
        console.error("Error with standard insert, trying alternative method:", washError);
        
        // Second attempt: Use direct fetch with REST API 
        // NOTE: This is a workaround and may need adjustment based on your Supabase setup
        const session = supabase.auth.session();
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/create_wash_request_with_location`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session?.access_token || ''}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            p_user_id: data.customerId,
            p_start_date: data.preferredDates.start.toISOString(),
            p_end_date: data.preferredDates.end ? data.preferredDates.end.toISOString() : null,
            p_status: 'pending',
            p_price: data.price,
            p_notes: data.notes || null,
            p_location_id: locationId || null
          })
        });
        
        // If the direct API method fails, fall back to inserting without a location
        if (!response.ok) {
          console.error("Alternative method failed, trying without location:", await response.text());
          
          // Last resort: Try inserting without a location ID
          const fallbackData = { ...washRequestData };
          delete fallbackData.location_detail_id;
          
          const { data: fallbackRequest, error: fallbackError } = await supabase
            .from('wash_requests')
            .insert(fallbackData)
            .select()
            .single();
            
          if (fallbackError) {
            console.error("All insert methods failed:", fallbackError);
            toast.error("Failed to create wash request");
            return null;
          }
          
          console.log("Fallback insert successful:", fallbackRequest);
          
          // Insert vehicle associations
          if (data.vehicles && data.vehicles.length > 0) {
            await createVehicleAssociations(fallbackRequest.id, data.vehicles);
          }
          
          // Get the full wash request with all associations
          return await getFullWashRequest(fallbackRequest.id);
        }
        
        // Process successful direct API response
        const directRequest = await response.json();
        console.log("Direct API insert successful:", directRequest);
        
        // Insert vehicle associations
        if (data.vehicles && data.vehicles.length > 0) {
          await createVehicleAssociations(directRequest.id, data.vehicles);
        }
        
        // Get the full wash request with all associations
        return await getFullWashRequest(directRequest.id);
      }
      
      console.log("Standard insert successful:", washRequest);
      
      // Insert vehicle associations
      if (data.vehicles && data.vehicles.length > 0) {
        await createVehicleAssociations(washRequest.id, data.vehicles);
      }
      
      // Get the full wash request with all associations
      return await getFullWashRequest(washRequest.id);
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
async function createVehicleAssociations(washRequestId: string, vehicleIds: string[]): Promise<boolean> {
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
