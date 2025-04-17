
import { supabase } from "@/integrations/supabase/client";
import { CreateWashRequestData } from "../types";
import { WashRequest, WashStatus } from "@/models/types";
import { toast } from "sonner";
import { getFullWashRequest } from "./api/washRequestDetails";
import { syncLocationToWashLocations } from "./api/locationApi";

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

    // Insert the wash request using the synchronized location ID
    const { data: washRequest, error: washError } = await supabase
      .from('wash_requests')
      .insert({
        user_id: data.customerId,
        preferred_date_start: data.preferredDates.start.toISOString(),
        preferred_date_end: data.preferredDates.end ? data.preferredDates.end.toISOString() : null,
        status: 'pending' as WashStatus,
        price: data.price,
        notes: data.notes || null,
        location_id: locationId || null
      })
      .select()
      .single();

    if (washError) {
      console.error("Error creating wash request:", washError);
      toast.error("Failed to create wash request");
      return null;
    }

    console.log("Wash request created:", washRequest);

    // Insert vehicle associations
    if (data.vehicles && data.vehicles.length > 0) {
      const vehicleAssociations = data.vehicles.map(vehicleId => ({
        wash_request_id: washRequest.id,
        vehicle_id: vehicleId
      }));

      const { error: vehicleError } = await supabase
        .from('wash_request_vehicles')
        .insert(vehicleAssociations);

      if (vehicleError) {
        console.error("Error associating vehicles:", vehicleError);
        toast.error("Failed to associate vehicles with wash request");
        // Consider deleting the wash request if vehicle association fails
      }
    }

    // Get the full wash request with all associations
    return await getFullWashRequest(washRequest.id);
  } catch (error) {
    console.error("Error creating wash request:", error);
    toast.error("Failed to create wash request");
    return null;
  }
}
