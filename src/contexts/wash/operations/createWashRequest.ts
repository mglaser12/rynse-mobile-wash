
import { supabase } from "@/integrations/supabase/client";
import { CreateWashRequestData } from "../types";
import { WashRequest, WashStatus } from "@/models/types";
import { toast } from "sonner";
import { getFullWashRequest } from "./washRequestApi";

/**
 * Create a new wash request in the database
 */
export async function createWashRequest(data: CreateWashRequestData): Promise<WashRequest | null> {
  try {
    console.log("Creating wash request with data:", data);

    // Check if we need to sync locations between tables
    if (data.locationId) {
      const { data: locationData, error: locationFetchError } = await supabase
        .from('locations')
        .select('*')
        .eq('id', data.locationId)
        .single();
        
      if (locationFetchError) {
        console.error("Error fetching location:", locationFetchError);
        toast.error("Failed to create wash request - location not found");
        return null;
      }
      
      // Check if this location exists in wash_locations table
      const { data: washLocation, error: washLocationError } = await supabase
        .from('wash_locations')
        .select('id')
        .eq('name', locationData.name)
        .eq('address', locationData.address)
        .single();
        
      if (washLocationError || !washLocation) {
        // Location doesn't exist in wash_locations table, create it
        console.log("Location not found in wash_locations, creating entry");
        const { data: newWashLocation, error: createError } = await supabase
          .from('wash_locations')
          .insert({
            name: locationData.name,
            address: locationData.address,
            city: locationData.city,
            state: locationData.state,
            zip_code: locationData.zip_code,
            latitude: locationData.latitude,
            longitude: locationData.longitude
          })
          .select('id')
          .single();
          
        if (createError) {
          console.error("Error creating location in wash_locations:", createError);
          toast.error("Failed to create wash request - couldn't sync location");
          return null;
        }
        
        // Use the newly created wash_location id instead
        data.locationId = newWashLocation.id;
      } else {
        // Use the existing wash_location id
        data.locationId = washLocation.id;
      }
    }

    // Insert the wash request
    const { data: washRequest, error: washError } = await supabase
      .from('wash_requests')
      .insert({
        user_id: data.customerId,
        preferred_date_start: data.preferredDates.start.toISOString(),
        preferred_date_end: data.preferredDates.end ? data.preferredDates.end.toISOString() : null,
        status: 'pending' as WashStatus, // Explicitly type as WashStatus
        price: data.price,
        notes: data.notes || null,
        location_id: data.locationId || null
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
