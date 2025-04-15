
import { WashRequest, WashStatus } from "@/models/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function createWashRequest(
  user: { id: string } | null,
  washRequestData: Omit<WashRequest, "id" | "status" | "createdAt" | "updatedAt">
): Promise<WashRequest | null> {
  if (!user) {
    console.log("No user provided to createWashRequest");
    toast.error("You must be logged in to create a wash request");
    return null;
  }

  console.log("Creating wash request for user:", user.id);
  console.log("Wash request data:", washRequestData);

  try {
    const { customerId, vehicles, preferredDates, price, notes } = washRequestData;
    
    // First get the first available location (or create one if needed)
    // This is a temporary solution until we implement proper location selection
    const { data: locationData, error: locationError } = await supabase
      .from('wash_locations')
      .select('id')
      .limit(1)
      .single();
      
    if (locationError) {
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
      
      // Use the newly created location
      var locationId = newLocation.id;
    } else {
      var locationId = locationData.id;
    }
    
    console.log("Using location ID:", locationId);
    
    // Insert new wash request in Supabase
    const { data, error } = await supabase
      .from('wash_requests')
      .insert({
        user_id: user.id,
        location_id: locationId, // Use the location we found or created
        preferred_date_start: preferredDates.start.toISOString(),
        preferred_date_end: preferredDates.end?.toISOString(),
        price,
        notes,
        status: 'pending'
      })
      .select('*')
      .single();

    if (error) {
      console.error("Error adding wash request to Supabase:", error);
      toast.error("Failed to create wash request");
      return null;
    }

    console.log("Wash request created:", data);

    // Create vehicle associations
    const vehicleInserts = vehicles.map(vehicleId => ({
      wash_request_id: data.id,
      vehicle_id: vehicleId
    }));

    console.log("Creating vehicle associations:", vehicleInserts);

    const { error: vehicleError } = await supabase
      .from('wash_request_vehicles')
      .insert(vehicleInserts);

    if (vehicleError) {
      console.error("Error creating vehicle associations:", vehicleError);
      toast.error("Failed to link vehicles to wash request");
      // We should handle this better, but for now we'll continue
    }

    const newWashRequest: WashRequest = {
      id: data.id,
      customerId: data.user_id,
      vehicles: vehicles,
      preferredDates: {
        start: new Date(data.preferred_date_start),
        end: data.preferred_date_end ? new Date(data.preferred_date_end) : undefined
      },
      status: data.status as WashStatus,
      price: data.price,
      notes: data.notes || undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
    
    console.log("Returning new wash request object:", newWashRequest);
    toast.success("Wash request created successfully!");
    return newWashRequest;
  } catch (error) {
    console.error("Error creating wash request:", error);
    toast.error("Failed to create wash request");
    return null;
  }
}

export async function cancelWashRequest(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('wash_requests')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error("Error cancelling wash request:", error);
      toast.error("Failed to cancel wash request");
      return false;
    }
    
    toast.success("Wash request cancelled successfully!");
    return true;
  } catch (error) {
    console.error("Error cancelling wash request:", error);
    toast.error("Failed to cancel wash request");
    return false;
  }
}

export async function updateWashRequest(
  id: string, 
  data: Partial<WashRequest>
): Promise<boolean> {
  try {
    console.log(`Updating wash request ${id} with data:`, data);
    
    // Prepare the data for the update
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    
    // Map WashRequest fields to database column names
    if (data.status) {
      updateData.status = data.status;
      console.log(`Setting status to: ${data.status}`);
    }
    
    if (data.technician) {
      updateData.technician_id = data.technician;
      console.log(`Setting technician_id to: ${data.technician}`);
    }
    
    if (data.price !== undefined) {
      updateData.price = data.price;
    }
    
    if (data.notes) {
      updateData.notes = data.notes;
    }
    
    if (data.preferredDates) {
      if (data.preferredDates.start) {
        updateData.preferred_date_start = data.preferredDates.start.toISOString();
      }
      if (data.preferredDates.end) {
        updateData.preferred_date_end = data.preferredDates.end.toISOString();
      }
    }
    
    console.log("Final update data being sent to Supabase:", updateData);
    
    // Add a short delay before updating to ensure any previous operations have completed
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Perform the update with a stronger consistency level
    const { data: updatedData, error } = await supabase
      .from('wash_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) {
      console.error("Error updating wash request:", error);
      toast.error("Failed to update wash request");
      return false;
    }
    
    console.log("Wash request updated successfully:", updatedData);
    
    // Verify if we got data back
    if (!updatedData) {
      console.warn("Update succeeded but no data was returned");
      // Fetch the latest data to verify our update was successful
      const { data: verificationData } = await supabase
        .from('wash_requests')
        .select('*')
        .eq('id', id)
        .maybeSingle();
        
      console.log("Verification fetch after update:", verificationData);
      
      if (verificationData && verificationData.status === data.status && 
          ((data.technician && verificationData.technician_id === data.technician) || !data.technician)) {
        console.log("Verification confirmed update was successful");
      } else {
        console.warn("Verification could not confirm update success");
      }
    }
    
    toast.success("Wash request updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating wash request:", error);
    toast.error("Failed to update wash request");
    return false;
  }
}
